import axios from 'axios';
import type { 
  User, Problem, Solution, AuthResponse, LoginRequest, SignupRequest, 
  ProblemCreateRequest, SolutionCreateRequest, ValidationCreateRequest 
} from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  }
};

export const problemService = {
  async getProblems(): Promise<Problem[]> {
    const response = await api.get('/problems');
    return response.data;
  },

  async getProblem(id: number): Promise<Problem> {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  async createProblem(data: ProblemCreateRequest): Promise<Problem> {
    const response = await api.post('/problems', data);
    return response.data;
  }
};

export const solutionService = {
  async submitSolution(data: SolutionCreateRequest): Promise<Solution> {
    const response = await api.post('/solutions', data);
    return response.data;
  },

  async getPendingSolutions(): Promise<Solution[]> {
    const response = await api.get('/solutions/pending');
    return response.data;
  }
};

export const validationService = {
  async validateSolution(data: ValidationCreateRequest) {
    const response = await api.post('/validations', data);
    return response.data;
  }
};