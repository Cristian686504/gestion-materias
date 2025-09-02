# Overview

This is a Node.js web application for academic course management built with Express.js and MongoDB. The system supports two user roles: Students and Administrators. Students can view their course dashboard, while Administrators can manage users through a dedicated admin panel. The application features role-based authentication using JWT tokens and cookie-based session management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
- **Framework**: Express.js server with EJS templating engine
- **Authentication**: JWT-based authentication with cookie storage for session persistence
- **Route Structure**: Modular routing with separate routes for users (`/user/*`) and admins (`/admin/*`)
- **Middleware Stack**: Custom authentication middleware, cookie parser, and role-based access control
- **Controllers**: Separated business logic into dedicated controllers for authentication, users, and subjects (materias)

## Database Design
- **Database**: MongoDB with Mongoose ODM
- **Models**: 
  - User model with username, email, password, and role fields
  - Materia (Subject) model with course information and prerequisites
  - Cursa model for tracking user-course enrollment status
  - Historial model for academic history tracking
- **Relationships**: References between users and subjects for enrollment tracking

## Authentication & Authorization
- **JWT Implementation**: Secure token generation with 24-hour expiration
- **Role-Based Access**: Two-tier system (Student/Administrator) with route-level protection
- **Session Management**: HTTP-only cookies for tokens, regular cookies for user info
- **Password Security**: Bcrypt hashing for password storage

## Frontend Architecture
- **Template Engine**: EJS for server-side rendering
- **Static Assets**: Organized CSS and JavaScript files in public directory
- **Client-Side Logic**: AJAX-based forms for user registration and login
- **Responsive Design**: Modern CSS with gradient backgrounds and floating animations
- **Admin Interface**: Dedicated admin panel for user management (CRUD operations)

## Security Features
- **Input Validation**: Server-side validation for usernames, emails, and passwords
- **Route Protection**: Middleware-based authentication checks
- **Environment Variables**: Secure storage of JWT secrets and database credentials
- **Error Handling**: Graceful error responses with JSON formatting

# External Dependencies

## Core Dependencies
- **express**: Web application framework
- **mongoose**: MongoDB object modeling and connection management
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing and verification
- **cookie-parser**: Cookie parsing middleware
- **ejs**: Embedded JavaScript templating

## Development Dependencies
- **@types/node**: TypeScript definitions for Node.js
- **socket.io**: Real-time communication capabilities (prepared for future features)

## Database
- **MongoDB**: Primary database for user data, course information, and academic records
- **Connection**: Environment-based MongoDB URI configuration

## Environment Variables Required
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Application port (defaults to 5000)