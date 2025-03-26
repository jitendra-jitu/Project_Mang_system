# API Endpoints

## 1. Authentication Endpoints

### Register a User
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/auth/register`  
**Body (raw JSON):**  
```json
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "123456",
  "role": "user"
}
```
**Expected Response:** 200 with token  

### Register an Admin (do this first)
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "123456",
  "role": "admin"
}
```

### Login
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/auth/login`  
**Body (raw JSON):**  
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```
**Expected Response:** 200 with token  

**Note:** Save this token for authenticated requests

---

## 2. User Management Endpoints (Admin Only)

First, set the Authorization header in Postman:  
**Key:** Authorization  
**Value:** `Bearer <your_token_from_login>`  

### Get All Users
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/users`  
**Expected Response:** 200 with array of users  

### Create User
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/users`  
**Body:**  
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "123456",
  "role": "user"
}
```
**Expected Response:** 201 with created user  

### Get Single User
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/users/{user_id}`  
**Expected Response:** 200 with user data  

### Update User
**Method:** PUT  
**URL:** `http://localhost:5000/api/v1/users/{user_id}`  
**Body:**  
```json
{
  "name": "Updated User Name"
}
```
**Expected Response:** 200 with updated user  

### Delete User
**Method:** DELETE  
**URL:** `http://localhost:5000/api/v1/users/{user_id}`  
**Expected Response:** 200 with empty data object  

---

## 3. Project Management Endpoints

### Create Project
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/projects`  
**Body:**  
```json
{
  "name": "New Project",
  "description": "Project description here",
  "assignedUsers": ["user_id_1", "user_id_2"]
}
```
**Expected Response:** 201 with project data  

### Get All Projects
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/projects`  
**Expected Response:** 200 with array of projects  

### Get Projects by User
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/users/{user_id}/projects`  
**Expected Response:** 200 with projects assigned to that user  

### Get Single Project
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/projects/{project_id}`  
**Expected Response:** 200 with project details including assigned users  

### Update Project
**Method:** PUT  
**URL:** `http://localhost:5000/api/v1/projects/{project_id}`  
**Body:**  
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```
**Expected Response:** 200 with updated project  

### Delete Project
**Method:** DELETE  
**URL:** `http://localhost:5000/api/v1/projects/{project_id}`  
**Expected Response:** 200 with empty data object  

---

## 4. Task Management Endpoints

### Create Task
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/projects/{project_id}/tasks`  
**Body:**  
```json
{
  "name": "New Task",
  "description": "Task description here",
  "assignedUser": "user_id_1",
  "startDate": "2023-06-01",
  "endDate": "2023-06-10"
}
```
**Expected Response:** 201 with task data  

### Get All Tasks
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/tasks`  
**Expected Response:** 200 with array of all tasks  

### Get Tasks by Project
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/projects/{project_id}/tasks`  
**Expected Response:** 200 with tasks for that project  

### Get Tasks by User
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/users/{user_id}/tasks`  
**Expected Response:** 200 with tasks assigned to that user  

### Get Single Task
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/tasks/{task_id}`  
**Expected Response:** 200 with task details  

### Update Task
**Method:** PUT  
**URL:** `http://localhost:5000/api/v1/tasks/{task_id}`  
**Body:**  
```json
{
  "name": "Updated Task Name",
  "status": "in-progress"
}
```
**Expected Response:** 200 with updated task  

### Update Task Status
**Method:** PUT  
**URL:** `http://localhost:5000/api/v1/tasks/{task_id}/status`  
**Body:**  
```json
{
  "status": "completed"
}
```
**Expected Response:** 200 with updated task  

### Delete Task
**Method:** DELETE  
**URL:** `http://localhost:5000/api/v1/tasks/{task_id}`  
**Expected Response:** 200 with empty data object

