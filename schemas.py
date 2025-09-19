from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    token_balance: float
    reputation: int
    is_validator: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Problem schemas
class ProblemCreate(BaseModel):
    title: str
    description: str
    reward_amount: Optional[float] = 10.0

class Problem(BaseModel):
    id: int
    title: str
    description: str
    author_id: int
    author: User
    reward_amount: float
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProblemWithSolutions(Problem):
    solutions: List['Solution'] = []

# Solution schemas
class SolutionCreate(BaseModel):
    content: str
    problem_id: int

class Solution(BaseModel):
    id: int
    content: str
    problem_id: int
    solver_id: int
    solver: User
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class SolutionWithProblem(Solution):
    problem: Problem

# Validation schemas
class ValidationCreate(BaseModel):
    solution_id: int
    decision: str  # "approved" or "rejected"
    feedback: Optional[str] = None

class Validation(BaseModel):
    id: int
    solution_id: int
    validator_id: int
    validator: User
    decision: str
    feedback: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Update forward references
ProblemWithSolutions.model_rebuild()