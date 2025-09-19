from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(100), nullable=False)
    token_balance = Column(Float, default=100.0)  # Starting balance
    reputation = Column(Integer, default=0)
    is_validator = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    posted_problems = relationship("Problem", back_populates="author")
    submitted_solutions = relationship("Solution", back_populates="solver")
    validations = relationship("Validation", back_populates="validator")

class Problem(Base):
    __tablename__ = "problems"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reward_amount = Column(Float, default=10.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    author = relationship("User", back_populates="posted_problems")
    solutions = relationship("Solution", back_populates="problem")

class Solution(Base):
    __tablename__ = "solutions"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    solver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    problem = relationship("Problem", back_populates="solutions")
    solver = relationship("User", back_populates="submitted_solutions")
    validations = relationship("Validation", back_populates="solution")

class Validation(Base):
    __tablename__ = "validations"
    
    id = Column(Integer, primary_key=True, index=True)
    solution_id = Column(Integer, ForeignKey("solutions.id"), nullable=False)
    validator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(String(20), nullable=False)  # approved, rejected
    feedback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    solution = relationship("Solution", back_populates="validations")
    validator = relationship("User", back_populates="validations")