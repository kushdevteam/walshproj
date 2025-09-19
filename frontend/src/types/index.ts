export interface User {
  id: number;
  username: string;
  token_balance: number;
  reputation: number;
  is_validator: boolean;
  created_at: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  author_id: number;
  author: User;
  reward_amount: number;
  is_active: boolean;
  created_at: string;
  solutions?: Solution[];
}

export interface Solution {
  id: number;
  content: string;
  problem_id: number;
  solver_id: number;
  solver: User;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  problem?: Problem;
}

export interface Validation {
  id: number;
  solution_id: number;
  validator_id: number;
  validator: User;
  decision: 'approved' | 'rejected';
  feedback?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface ProblemCreateRequest {
  title: string;
  description: string;
  reward_amount?: number;
}

export interface SolutionCreateRequest {
  content: string;
  problem_id: number;
}

export interface ValidationCreateRequest {
  solution_id: number;
  decision: 'approved' | 'rejected';
  feedback?: string;
}