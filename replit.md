# Overview

This is a Proof-of-Intelligence Network application that creates a decentralized problem-solving platform where users can post problems, submit solutions, and earn tokens. The system implements a validation mechanism where approved validators review solutions and award tokens to successful solvers. The platform features a token-based economy to incentivize high-quality problem-solving and maintain network integrity.

## Recent Changes (September 19, 2025)
Successfully imported GitHub project and configured for Replit environment:
- **Dependencies**: Installed Python dependencies via uv and Node.js dependencies via pnpm
- **Development Workflows**: Backend runs on port 8000, frontend on port 5000
- **Security**: Fixed CORS configuration to use regex patterns instead of wildcard origins
- **Host Configuration**: Configured Vite to allow all hosts for Replit's proxy system
- **API Configuration**: Updated frontend to dynamically determine backend URL from window.location
- **Deployment**: Configured VM deployment with static file serving for production

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
The backend is built with FastAPI and follows a RESTful API design pattern. Key architectural decisions include:

**Database Layer**: Uses SQLAlchemy ORM with SQLite for local development, providing a clean abstraction over database operations. The models follow a relational structure with proper foreign key relationships between Users, Problems, Solutions, and Validations.

**Authentication System**: Implements JWT-based authentication with bcrypt password hashing. Tokens expire after 30 minutes for security, and the system includes middleware for automatic token validation on protected routes.

**Authorization Model**: Features a role-based system where users can become validators, enabling a peer-review mechanism for solution quality control.

**API Structure**: Organized into logical service modules (auth, problems, solutions, validations) with clear separation of concerns. Each endpoint follows RESTful conventions and includes proper error handling.

## Frontend Architecture
The frontend is a React 18 application using TypeScript for type safety and Vite for fast development.

**Component Architecture**: Follows a container/presentational component pattern with reusable UI components and page-level containers that manage state and API interactions.

**State Management**: Uses React Context API for global authentication state and local component state for feature-specific data. This avoids over-engineering while maintaining clean data flow.

**Routing Strategy**: Implements protected routes that automatically redirect unauthenticated users to login, and validator-only routes for administrative functions.

**Styling Approach**: Uses Tailwind CSS with a custom design system including predefined color palettes and component classes for consistency.

## Data Flow Design
The application follows a unidirectional data flow pattern where API calls originate from page components, flow through service layers, and update local state. Authentication state is managed globally and automatically injects tokens into API requests.

## Token Economy System
Implements a simple token-based reward system where users start with 100 tokens, spend tokens to post problems, and earn tokens by solving approved problems. This creates economic incentives for quality participation.

# External Dependencies

## Core Framework Dependencies
- **FastAPI**: Python web framework for building the REST API with automatic OpenAPI documentation
- **SQLAlchemy**: ORM for database operations with declarative model definitions
- **SQLite**: Embedded database for development and simple deployments
- **React 18**: Frontend framework with modern hooks and concurrent features
- **TypeScript**: Type safety for frontend development
- **Vite**: Build tool and development server for fast frontend development

## Authentication & Security
- **python-jose**: JWT token creation and validation library
- **passlib**: Password hashing library with bcrypt support
- **bcrypt**: Secure password hashing algorithm

## UI & Styling Libraries
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library providing consistent iconography
- **React Router DOM**: Client-side routing for single-page application navigation

## HTTP & API Communication
- **Axios**: HTTP client for API communication with request/response interceptors
- **CORS Middleware**: Handles cross-origin requests between frontend and backend during development

## Development Tools
- **Autoprefixer**: CSS post-processor for browser compatibility
- **PostCSS**: CSS transformation tool working with Tailwind
- **@types packages**: TypeScript type definitions for better development experience

The system is designed to be easily deployable with minimal external service dependencies, making it suitable for both development and simple production environments.