from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
from auth import get_password_hash
from datetime import datetime, timedelta
import random

def create_demo_data():
    # Create database tables
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing data (for demo purposes)
        db.query(models.Validation).delete()
        db.query(models.Solution).delete()
        db.query(models.Problem).delete()
        db.query(models.User).delete()
        db.commit()
        
        # Create demo users
        demo_users = [
            {"username": "alex_coder", "reputation": 450, "is_validator": True, "token_balance": 275.0},
            {"username": "sarah_ai", "reputation": 320, "is_validator": True, "token_balance": 180.0},
            {"username": "mike_crypto", "reputation": 280, "is_validator": False, "token_balance": 150.0},
            {"username": "jenny_ml", "reputation": 510, "is_validator": True, "token_balance": 340.0},
            {"username": "david_web3", "reputation": 190, "is_validator": False, "token_balance": 95.0},
            {"username": "lisa_data", "reputation": 380, "is_validator": True, "token_balance": 220.0},
        ]
        
        created_users = []
        for user_data in demo_users:
            user = models.User(
                username=user_data["username"],
                hashed_password=get_password_hash("demo123"),
                reputation=user_data["reputation"],
                is_validator=user_data["is_validator"],
                token_balance=user_data["token_balance"],
                created_at=datetime.utcnow() - timedelta(days=random.randint(30, 365))
            )
            db.add(user)
            created_users.append(user)
        
        db.commit()
        
        # Create demo problems
        demo_problems = [
            {
                "title": "Optimize Database Query Performance",
                "description": "We have a slow-running query that takes 5+ seconds to execute on our user analytics table. The query joins 3 tables and filters by date range and user activity. Need to reduce execution time to under 500ms while maintaining accuracy.",
                "reward_amount": 50.0,
                "author": created_users[0]
            },
            {
                "title": "Implement JWT Token Refresh Mechanism",
                "description": "Our current authentication system uses JWT tokens that expire after 1 hour. We need a secure token refresh mechanism that allows users to stay logged in without frequent re-authentication while maintaining security best practices.",
                "reward_amount": 40.0,
                "author": created_users[1]
            },
            {
                "title": "Design Scalable Microservices Architecture",
                "description": "Convert our monolithic e-commerce application into a microservices architecture. Need recommendations for service boundaries, communication patterns, data consistency strategies, and deployment approach for handling 100K+ daily users.",
                "reward_amount": 80.0,
                "author": created_users[2]
            },
            {
                "title": "Machine Learning Model for Fraud Detection",
                "description": "Develop an ML model to detect fraudulent transactions in real-time. Dataset includes transaction amount, user behavior patterns, merchant data, and geographical information. Need 95%+ accuracy with minimal false positives.",
                "reward_amount": 75.0,
                "author": created_users[3]
            },
            {
                "title": "React Performance Optimization",
                "description": "Our React dashboard with 50+ charts is experiencing performance issues. Need to optimize re-renders, implement efficient data fetching strategies, and improve initial load time from 8s to under 3s.",
                "reward_amount": 35.0,
                "author": created_users[4]
            },
            {
                "title": "Blockchain Smart Contract Security Audit",
                "description": "Review and audit our DeFi protocol smart contracts for security vulnerabilities. Contracts handle token swaps, liquidity pools, and yield farming. Need comprehensive security analysis and recommendations.",
                "reward_amount": 120.0,
                "author": created_users[5]
            }
        ]
        
        created_problems = []
        for i, problem_data in enumerate(demo_problems):
            problem = models.Problem(
                title=problem_data["title"],
                description=problem_data["description"],
                reward_amount=problem_data["reward_amount"],
                author_id=problem_data["author"].id,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 14))
            )
            db.add(problem)
            created_problems.append(problem)
        
        db.commit()
        
        # Create demo solutions
        demo_solutions = [
            {
                "content": "Add composite index on (user_id, created_at, activity_type). Use query plan analysis to identify bottlenecks. Consider partitioning by date range for large datasets. Implemented similar optimization that reduced query time from 6s to 300ms.",
                "problem": created_problems[0],
                "solver": created_users[2],
                "status": "approved"
            },
            {
                "content": "Implement sliding window approach with refresh token rotation. Store refresh tokens in secure HttpOnly cookies with short expiration. Use Redis for token blacklisting. Include CSRF protection and rate limiting.",
                "problem": created_problems[1],
                "solver": created_users[4],
                "status": "pending"
            },
            {
                "content": "Domain-driven design approach: User Service, Product Service, Order Service, Payment Service. Use event sourcing for data consistency. API Gateway with service mesh (Istio). Container orchestration with Kubernetes.",
                "problem": created_problems[2],
                "solver": created_users[1],
                "status": "approved"
            },
            {
                "content": "Random Forest ensemble with feature engineering on transaction patterns, device fingerprinting, and velocity checks. Use SMOTE for handling imbalanced data. Real-time inference with model versioning and A/B testing.",
                "problem": created_problems[3],
                "solver": created_users[0],
                "status": "pending"
            },
            {
                "content": "Implement React.memo for chart components, virtualization for large lists, debounce data fetching, code splitting with lazy loading. Use React DevTools Profiler to identify render bottlenecks.",
                "problem": created_problems[4],
                "solver": created_users[3],
                "status": "approved"
            },
        ]
        
        created_solutions = []
        for solution_data in demo_solutions:
            solution = models.Solution(
                content=solution_data["content"],
                problem_id=solution_data["problem"].id,
                solver_id=solution_data["solver"].id,
                status=solution_data["status"],
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 7))
            )
            db.add(solution)
            created_solutions.append(solution)
        
        db.commit()
        
        # Create demo validations for approved solutions
        for solution in created_solutions:
            if solution.status == "approved":
                available_validators = [u for u in created_users if u.is_validator and u.id != solution.solver_id]
                if available_validators:
                    validator = random.choice(available_validators)
                    validation = models.Validation(
                        solution_id=solution.id,
                        validator_id=validator.id,
                        decision="approved",
                        feedback="Great solution! Well-structured approach with practical implementation details.",
                        created_at=solution.created_at + timedelta(hours=random.randint(2, 24))
                    )
                    db.add(validation)
        
        db.commit()
        print(f"Demo data created successfully!")
        print(f"Users: {len(created_users)}")
        print(f"Problems: {len(created_problems)}")
        print(f"Solutions: {len(created_solutions)}")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_data()