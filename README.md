# College Portal Backend API

A production-ready College Portal RESTful backend built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **Nodemon**.

---

## 🚀 Key Architectural Highlights

1. **Single User Schema**:
   Students and Teachers share a single unified `User` schema containing shared fields (`name`, `email`, `password`, `role`, `department`, `phone`, `avatar`) as well as role-specific fields (e.g. `rollNumber`, `semester`, `batch`, `cgpa` for Students, and `employeeId`, `designation`, `qualification`, `subjectsTaught`, `officeRoom` for Teachers).
2. **Two Independent Middlewares**:
   - **`authMiddleware`**: Validates JWT Bearer tokens from the `Authorization` header, retrieves the user from the database, and attaches it to `req.user`.
   - **`permissionMiddleware(...roles)`**: Role-Based Access Control (RBAC) middleware verifying whether the authenticated user has permissions to access the target endpoint.
3. **Role Permissions**:
   - **Student Access**:
     - `GET /api/students` (Get all students)
     - `GET /api/students/:id` (Get student by ID)
     - `GET /api/users/profile` (Get own profile)
     - `PUT /api/users/profile` (Update own profile)
   - **Teacher Access**:
     - `GET /api/teachers` (Get all teachers)
     - `GET /api/teachers/:id` (Get teacher by ID)
     - `GET /api/students` (Get all students)
     - `GET /api/students/:id` (Get student by ID)
     - `GET /api/users/profile` (Get own profile)
     - `PUT /api/users/profile` (Update own profile)
     - `PUT /api/students/:id` (Update student records/grades)

---

## 📁 Project Folder Structure

```
portal naren/
├── .env                        # Local environment variables
├── .env.example                # Example environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies and npm scripts ('dev': 'nodemon app.js')
├── app.js                      # Main entry point: connects DB, configures Express, starts server
├── test_portal.js              # Automated integration and permission test suite
├── README.md                   # Full documentation and API guide
└── src/
    ├── config/
    │   └── db.js               # MongoDB connection configuration
    ├── models/
    │   └── user.model.js       # Unified single User schema (Student & Teacher)
    ├── middlewares/
    │   ├── auth.middleware.js        # JWT token authentication middleware
    │   ├── permission.middleware.js  # Role-based access permission middleware
    │   └── error.middleware.js       # Centralized error & 404 handler middlewares
    ├── controllers/
    │   ├── auth.controller.js        # User signup & login controllers
    │   ├── user.controller.js        # Self profile management controllers
    │   ├── student.controller.js     # Student retrieval & teacher updates
    │   └── teacher.controller.js     # Teacher retrieval controllers
    └── routes/
        ├── index.js                  # Centralized API route hub
        ├── auth.routes.js            # /api/auth routes
        ├── user.routes.js            # /api/users routes
        ├── student.routes.js         # /api/students routes
        └── teacher.routes.js         # /api/teachers routes
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **MongoDB**: Active running instance (default `mongodb://localhost:27017/college_portal`)

### 2. Environment Setup
Check or edit the `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college_portal
JWT_SECRET=super_secret_jwt_key_college_portal_2026_xyz
JWT_EXPIRES_IN=7d
```

### 3. Run with Nodemon (Development Mode)
```bash
npm run dev
```

### 4. Run in Production Mode
```bash
npm start
```

### 5. Run Automated Tests
```bash
npm test
```

---

## 🔐 Permission Access Matrix

| Endpoint | Method | Public | Student | Teacher | Notes |
|---|---|:---:|:---:|:---:|---|
| `/api/auth/signup` | POST | ✅ | ✅ | ✅ | Register as `Student` or `Teacher` |
| `/api/auth/login` | POST | ✅ | ✅ | ✅ | Authenticate & obtain JWT token |
| `/api/users/profile` | GET | ❌ | ✅ | ✅ | View own user profile |
| `/api/users/profile` | PUT | ❌ | ✅ | ✅ | Update own profile |
| `/api/students` | GET | ❌ | ✅ | ✅ | View list of all students |
| `/api/students/:id` | GET | ❌ | ✅ | ✅ | View individual student details |
| `/api/students/:id` | PUT | ❌ | ❌ (403) | ✅ | Teacher updates student record/grades |
| `/api/teachers` | GET | ❌ | ❌ (403) | ✅ | Teacher directory |
| `/api/teachers/:id` | GET | ❌ | ❌ (403) | ✅ | View teacher details |

---

## 📡 API Reference & Payload Examples

### 1. Public APIs

#### A. Signup (`POST /api/auth/signup`)
**Register as a Student:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul.student@college.edu",
  "password": "Password123!",
  "role": "Student",
  "phone": "9876543210",
  "department": "Computer Science",
  "rollNumber": "CS2026-001",
  "semester": 4,
  "batch": "2024-2028",
  "cgpa": 8.75,
  "guardianName": "Sanjay Sharma"
}
```

**Register as a Teacher:**
```json
{
  "name": "Dr. Anita Roy",
  "email": "anita.teacher@college.edu",
  "password": "Password123!",
  "role": "Teacher",
  "phone": "9876543299",
  "department": "Computer Science",
  "employeeId": "EMP-T-102",
  "designation": "Associate Professor",
  "qualification": "Ph.D in Computer Science",
  "subjectsTaught": ["Data Structures", "Algorithms"],
  "officeRoom": "Block B - Room 304"
}
```

#### B. Login (`POST /api/auth/login`)
```json
{
  "email": "rahul.student@college.edu",
  "password": "Password123!"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Welcome back, Rahul Sharma! Logged in as Student.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "_id": "6ad30...",
    "name": "Rahul Sharma",
    "email": "rahul.student@college.edu",
    "role": "Student",
    "rollNumber": "CS2026-001"
  }
}
```

---

### 2. Protected Routes (Header: `Authorization: Bearer <TOKEN>`)

#### A. Profile Routes
- **Get Profile**: `GET /api/users/profile`
- **Update Profile**: `PUT /api/users/profile`
```json
{
  "phone": "9998887776",
  "guardianName": "Sanjay K. Sharma"
}
```

#### B. Student Routes
- **Get All Students**: `GET /api/students` (Query params supported: `department`, `batch`, `semester`, `search`)
- **Get Student by ID**: `GET /api/students/:id`
- **Update Student Record (Teacher Only)**: `PUT /api/students/:id`
```json
{
  "cgpa": 9.2,
  "semester": 5
}
```

#### C. Teacher Routes (Teacher Only)
- **Get All Teachers**: `GET /api/teachers` (Query params supported: `department`, `designation`, `search`)
- **Get Teacher by ID**: `GET /api/teachers/:id`
