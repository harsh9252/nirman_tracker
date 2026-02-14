# Nirman Tracker API Endpoints

This document provides a comprehensive list of all API endpoints available in the Nirman Tracker backend.

## Base URL
The API is accessible at `http://<host>:<port>/api` (Default: `http://localhost:5000/api`)

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new user | No |
| POST | `/login` | Log in with credentials | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password using token | No |
| POST | `/appuser-login` | Login for app users (identifier + plain text password) | No |
| POST | `/change-password` | Change user password | No |
| GET | `/profile` | Get current user's profile | Yes (JWT) |

---

## 2. Leads (`/api/leads`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get all leads |
| GET | `/:id` | Get lead by ID |
| POST | `/` | Create a new lead |
| PUT | `/:id` | Update an existing lead |
| DELETE | `/:id` | Delete a lead |
| POST | `/:id/convert` | Convert lead to client |

---

## 3. Clients (`/api/clients`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all clients | Yes |
| POST | `/` | Create a new client | Yes |
| GET | `/:id` | Get client by ID | Yes |
| PUT | `/:id` | Update client details | Yes |
| DELETE | `/:id` | Delete a client | Yes |

---

## 4. Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all users | Yes |
| GET | `/:id` | Get user by ID | Yes |
| GET | `/:id/check-deletion`| Check if user can be deleted | Yes |
| POST | `/` | Create a new user | Yes |
| PUT | `/:id` | Update user details | Yes |
| DELETE | `/:id` | Delete a user | Yes |

---

## 5. Tasks (`/api/tasks`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all tasks | Yes |
| GET | `/next-number` | Get next task number | Yes |
| GET | `/:id` | Get task by ID | Yes |
| POST | `/` | Create a new task | Yes |
| PUT | `/:id` | Update task status/details | Yes |
| DELETE | `/:id` | Delete a task | Yes |

---

## 6. Comments (`/api/comments`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/task/:taskId` | Get comments for a task | Yes |
| POST | `/` | Post a new comment | Yes |
| PUT | `/:id` | Edit a comment | Yes |
| DELETE | `/:id` | Delete a comment | Yes |
| GET | `/:commentId/replies` | Get replies to a comment | Yes |

---

## 7. Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get user notifications | Yes |
| GET | `/unread-count` | Get unread count | Yes |
| PUT | `/:id/read` | Mark as read | Yes |
| PUT | `/mark-all-read` | Mark all as read | Yes |
| DELETE | `/:id` | Delete notification | Yes |
| POST | `/` | Create notification (Admin) | Yes |

---

## 8. Projects (`/api/projects`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get all projects |
| GET | `/stats` | Get project statistics |
| GET | `/:id` | Get project by ID |
| GET | `/client/:clientId` | Get projects by client |
| POST | `/` | Create a new project |
| PUT | `/:id` | Update project details |
| DELETE | `/:id` | Delete a project |

---

## 9. Transactions (`/api/transactions`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create a transaction | Yes |
| GET | `/project/:projectId` | Get project transactions | Yes |
| GET | `/project/:projectId/summary` | Get financial summary | Yes |
| PUT | `/:id` | Update transaction | Yes |
| DELETE | `/:id` | Delete transaction | Yes |

---

## 10. Employees (`/api/employees`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all employees | Yes |
| GET | `/:id` | Get employee by ID | Yes |
| POST | `/` | Create an employee | Yes |
| PUT | `/:id` | Update employee info | Yes |
| GET | `/project/:projectId` | Get employees by project | Yes |
| DELETE | `/:id` | Delete an employee | Yes |

---

## 11. Attendance (`/api/attendance`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/record` | Record attendance (Single/Bulk) |
| GET | `/project/:projectId/date/:date` | Get attendance by date |
| GET | `/project/:projectId/range` | Get attendance by range |
| GET | `/project/:projectId/summary` | Get attendance summary |

---

## 12. Push Notifications (`/api/push`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/vapid-public-key` | Get service VAPID key | No |
| POST | `/subscribe` | Subscribe current user | Yes |
| POST | `/unsubscribe` | Unsubscribe current user | Yes |
| GET | `/subscription-status`| Get subscription status | Yes |
| POST | `/test-notification`| Send test push | Yes |

---

## 13. System Health

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/health` | Server health check |
| GET | `/health/db` | Database connectivity check |

---

## WebSocket Events (Socket.IO)

### Client to Server
- `join-user-room(userId)`: Join room for notifications
- `leave-user-room(userId)`: Leave room for notifications
- `join-task-room(taskId)`: Join room for real-time comments
- `leave-task-room(taskId)`: Leave room for real-time comments
- `typing-start(data)`: Broadcast typing status
- `typing-stop(data)`: Broadcast typing status

### Server to Client
- `new-notification`: New notification alert
- `user-typing`: Real-time typing indicator
