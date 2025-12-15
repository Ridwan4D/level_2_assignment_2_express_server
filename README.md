# Express Server

## Live URL
**Base API URL:** https://your-live-api-url.com

---

## Project Overview
This project is a **RESTful backend API** built using **Express.js** to manage a vehicle booking system.  
It supports **user authentication, role-based authorization, vehicle management, and booking operations** with a secure and scalable architecture.

The API is designed to be consumed by a frontend application and follows clean code practices, proper error handling, and standardised responses.

---

## Key Features
- User authentication using **JWT**
- Role-based authorization (**Admin / User**)
- Vehicle management (Add, update, view vehicles)
- Booking management with date validation
- Secure password hashing using **bcrypt**
- Centralized error handling
- Input validation
- Standardized API responses
- PostgreSQL database integration

---

##Technology Stack
- **Backend:** Node.js, Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Authentication:** JSON Web Token (JWT)
- **Security:** bcrypt
- **Environment Management:** dotenv

---

## Setup Instructions

### Step 1: Clone the Repository (in bash or terminal)
### Step 2: npm install (in bash or terminal)
### Step 3: Add .env file and docs, 
PORT = Your port
CONNECTION_STRING = Your postgresql connection string
AUTH_SECRET = Your jwt secret
### Step 4: npm run dev
