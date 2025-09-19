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

# Helper function to calculate reputation level
def get_reputation_level(reputation: int):
    if reputation < 100:
        return {
            "level": "Novice",
            "min_reputation": 0,
            "max_reputation": 99,
            "progress_percentage": min(100, (reputation / 100) * 100)
        }
    elif reputation < 500:
        return {
            "level": "Expert",
            "min_reputation": 100,
            "max_reputation": 499,
            "progress_percentage": min(100, ((reputation - 100) / 400) * 100)
        }
    else:
        return {
            "level": "Master",
            "min_reputation": 500,
            "max_reputation": 999,
            "progress_percentage": min(100, ((reputation - 500) / 500) * 100)
        }

# Helper function to create transaction record
def create_transaction(db: Session, user_id: int, transaction_type: str, amount: float, description: str, problem_id: Optional[int] = None, solution_id: Optional[int] = None):
    transaction = models.Transaction(
        user_id=user_id,
        type=transaction_type,
        amount=amount,
        description=description,
        problem_id=problem_id,
        solution_id=solution_id
    )
    db.add(transaction)
    return transaction

# Static files and frontend serving for production
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")
    
    # Only serve frontend for non-API routes - move this after all API routes are defined
    # This will be added at the end of the file

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

@app.get("/users/me/reputation", response_model=schemas.ReputationLevel)
def get_user_reputation_level(current_user: models.User = Depends(get_current_user)):
    return get_reputation_level(current_user.reputation)

@app.get("/users/me/transactions", response_model=List[schemas.Transaction])
def get_user_transactions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(models.Transaction.created_at.desc()).all()
    return transactions

# Problem endpoints
@app.post("/problems", response_model=schemas.Problem)
def create_problem(
    problem_data: schemas.ProblemCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if user has enough tokens
    if current_user.token_balance < problem_data.reward_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient token balance"
        )
    
    problem = models.Problem(
        title=problem_data.title,
        description=problem_data.description,
        author_id=current_user.id,
        reward_amount=problem_data.reward_amount
    )
    db.add(problem)
    
    # Deduct tokens from user balance
    db.query(models.User).filter(models.User.id == current_user.id).update({
        "token_balance": models.User.token_balance - problem_data.reward_amount
    })
    
    # Create transaction record
    create_transaction(
        db, current_user.id, "problem_post", -problem_data.reward_amount, 
        f"Posted problem: {problem_data.title}", problem_id=problem.id
    )
    
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
    if not current_user.is_validator:
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
    if not current_user.is_validator:
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
    
    # If approved, reward the solver and validator
    if validation_data.decision == "approved":
        solver = db.query(models.User).filter(models.User.id == solution.solver_id).first()
        problem = db.query(models.Problem).filter(models.Problem.id == solution.problem_id).first()
        if solver and problem:
            # Reward solver
            db.query(models.User).filter(models.User.id == solver.id).update({
                "token_balance": models.User.token_balance + problem.reward_amount,
                "reputation": models.User.reputation + 10
            })
            
            # Reward validator (5% of problem reward)
            validator_reward = problem.reward_amount * 0.05
            db.query(models.User).filter(models.User.id == current_user.id).update({
                "token_balance": models.User.token_balance + validator_reward,
                "reputation": models.User.reputation + 5
            })
            
            # Create transaction records
            create_transaction(
                db, solver.id, "solution_reward", problem.reward_amount,
                f"Solution approved for: {problem.title}", problem_id=problem.id, solution_id=solution.id
            )
            
            create_transaction(
                db, current_user.id, "validation_reward", validator_reward,
                f"Validated solution for: {problem.title}", problem_id=problem.id, solution_id=solution.id
            )
    
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

@app.get("/problems/{problem_id}/status")
def get_problem_status(problem_id: int, db: Session = Depends(get_db)):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    approved_solutions = db.query(models.Solution).filter(
        models.Solution.problem_id == problem_id,
        models.Solution.status == "approved"
    ).count()
    
    pending_solutions = db.query(models.Solution).filter(
        models.Solution.problem_id == problem_id,
        models.Solution.status == "pending"
    ).count()
    
    status = "open"
    if approved_solutions > 0:
        status = "solved"
    elif pending_solutions > 0:
        status = "in_review"
    
    return {"status": status, "approved_solutions": approved_solutions, "pending_solutions": pending_solutions}

# Note: Frontend is served separately on port 5000 in development
# Static file serving removed for clean API-only backend

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)