from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import engine, get_db, create_tables
from auth import verify_password, get_password_hash, create_access_token, verify_token
import os

app = FastAPI(title="Proof-of-Intelligence Network", version="1.0.0")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.replit\.dev(:\d+)?|http://localhost(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
create_tables()

# Static files and frontend serving for production
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")
    
    @app.get("/{path:path}")
    def serve_frontend(path: str = ""):
        # Serve API routes normally
        if path.startswith("auth/") or path.startswith("problems") or path.startswith("solutions") or path.startswith("validations") or path == "stats" or path.startswith("users/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Serve frontend files
        file_path = os.path.join("static", path if path else "index.html")
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        else:
            return FileResponse("static/index.html")  # SPA fallback

# Security
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    username = verify_token(credentials.credentials)
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

# Auth endpoints
@app.post("/auth/signup", response_model=schemas.Token)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = models.User(
        username=user_data.username,
        hashed_password=hashed_password,
        is_validator=True  # Make all users validators for MVP
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# User endpoints
@app.get("/users/me", response_model=schemas.User)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

# Problem endpoints
@app.post("/problems", response_model=schemas.Problem)
def create_problem(
    problem_data: schemas.ProblemCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    problem = models.Problem(
        title=problem_data.title,
        description=problem_data.description,
        author_id=current_user.id,
        reward_amount=problem_data.reward_amount
    )
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem

@app.get("/problems", response_model=List[schemas.Problem])
def get_problems(db: Session = Depends(get_db)):
    problems = db.query(models.Problem).filter(models.Problem.is_active.is_(True)).all()
    return problems

@app.get("/problems/{problem_id}", response_model=schemas.ProblemWithSolutions)
def get_problem(problem_id: int, db: Session = Depends(get_db)):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    return problem

# Solution endpoints
@app.post("/solutions", response_model=schemas.Solution)
def submit_solution(
    solution_data: schemas.SolutionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if problem exists
    problem = db.query(models.Problem).filter(models.Problem.id == solution_data.problem_id).first()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    # Check if user already submitted a solution for this problem
    existing_solution = db.query(models.Solution).filter(
        models.Solution.problem_id == solution_data.problem_id,
        models.Solution.solver_id == current_user.id
    ).first()
    
    if existing_solution:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a solution for this problem"
        )
    
    solution = models.Solution(
        content=solution_data.content,
        problem_id=solution_data.problem_id,
        solver_id=current_user.id
    )
    db.add(solution)
    db.commit()
    db.refresh(solution)
    return solution

@app.get("/solutions/pending", response_model=List[schemas.SolutionWithProblem])
def get_pending_solutions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not bool(current_user.is_validator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only validators can access pending solutions"
        )
    
    solutions = db.query(models.Solution).filter(models.Solution.status == "pending").all()
    return solutions

# Validation endpoints
@app.post("/validations", response_model=schemas.Validation)
def validate_solution(
    validation_data: schemas.ValidationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not bool(current_user.is_validator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only validators can validate solutions"
        )
    
    # Get the solution
    solution = db.query(models.Solution).filter(models.Solution.id == validation_data.solution_id).first()
    if not solution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solution not found"
        )
    
    if str(solution.status) != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solution has already been validated"
        )
    
    # Create validation record
    validation = models.Validation(
        solution_id=validation_data.solution_id,
        validator_id=current_user.id,
        decision=validation_data.decision,
        feedback=validation_data.feedback
    )
    db.add(validation)
    
    # Update solution status
    db.query(models.Solution).filter(models.Solution.id == validation_data.solution_id).update({"status": validation_data.decision})
    
    # If approved, reward the solver
    if validation_data.decision == "approved":
        solver = db.query(models.User).filter(models.User.id == solution.solver_id).first()
        problem = db.query(models.Problem).filter(models.Problem.id == solution.problem_id).first()
        if solver and problem:
            db.query(models.User).filter(models.User.id == solver.id).update({
                "token_balance": models.User.token_balance + problem.reward_amount,
                "reputation": models.User.reputation + 10
            })
    
    db.commit()
    db.refresh(validation)
    return validation

# Stats endpoint
@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_problems = db.query(models.Problem).count()
    total_solutions = db.query(models.Solution).count()
    total_users = db.query(models.User).count()
    pending_solutions = db.query(models.Solution).filter(models.Solution.status == "pending").count()
    
    return {
        "total_problems": total_problems,
        "total_solutions": total_solutions,
        "total_users": total_users,
        "pending_solutions": pending_solutions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)