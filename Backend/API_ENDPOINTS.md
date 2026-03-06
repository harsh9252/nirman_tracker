openapi: 3.0.3
info:
  title: Nirman Tracker API
  description: Backend API for Nirman Tracker application
  version: 1.0.0

servers:
  - url: http://localhost:5000/api
    description: Local server

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

paths:

  /auth/register:
    post:
      tags: [Auth]
      summary: Register a new user
      security: []
      responses:
        '201': { description: User registered }

  /auth/login:
    post:
      tags: [Auth]
      summary: Login user
      security: []
      responses:
        '200': { description: Login successful }

  /auth/forgot-password:
    post:
      tags: [Auth]
      summary: Request password reset
      security: []
      responses:
        '200': { description: Reset email sent }

  /auth/reset-password:
    post:
      tags: [Auth]
      summary: Reset password using token
      security: []
      responses:
        '200': { description: Password reset }

  /auth/appuser-login:
    post:
      tags: [Auth]
      summary: App user login
      security: []
      responses:
        '200': { description: Login successful }

  /auth/change-password:
    post:
      tags: [Auth]
      summary: Change password
      responses:
        '200': { description: Password changed }

  /auth/profile:
    get:
      tags: [Auth]
      summary: Get current user profile
      responses:
        '200': { description: User profile }

  /leads:
    get:
      tags: [Leads]
      summary: Get all leads
    post:
      tags: [Leads]
      summary: Create a new lead

  /leads/{id}:
    get:
      tags: [Leads]
      summary: Get lead by ID
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
    put:
      tags: [Leads]
      summary: Update lead
    delete:
      tags: [Leads]
      summary: Delete lead

  /leads/{id}/convert:
    post:
      tags: [Leads]
      summary: Convert lead to client

  /clients:
    get:
      tags: [Clients]
      summary: Get all clients
    post:
      tags: [Clients]
      summary: Create client

  /clients/{id}:
    get:
      tags: [Clients]
      summary: Get client by ID
    put:
      tags: [Clients]
      summary: Update client
    delete:
      tags: [Clients]
      summary: Delete client

  /users:
    get:
      tags: [Users]
      summary: Get all users
    post:
      tags: [Users]
      summary: Create user

  /users/{id}:
    get:
      tags: [Users]
      summary: Get user by ID
    put:
      tags: [Users]
      summary: Update user
    delete:
      tags: [Users]
      summary: Delete user

  /users/{id}/check-deletion:
    get:
      tags: [Users]
      summary: Check if user can be deleted

  /projects:
    get:
      tags: [Projects]
      summary: Get all projects
    post:
      tags: [Projects]
      summary: Create project

  /projects/stats:
    get:
      tags: [Projects]
      summary: Get project statistics

  /projects/{id}:
    get:
      tags: [Projects]
      summary: Get project by ID
    put:
      tags: [Projects]
      summary: Update project
    delete:
      tags: [Projects]
      summary: Delete project

  /projects/client/{clientId}:
    get:
      tags: [Projects]
      summary: Get projects by client

  /tasks:
    get:
      tags: [Tasks]
      summary: Get all tasks
    post:
      tags: [Tasks]
      summary: Create task

  /tasks/next-number:
    get:
      tags: [Tasks]
      summary: Get next task number

  /tasks/{id}:
    get:
      tags: [Tasks]
      summary: Get task by ID
    put:
      tags: [Tasks]
      summary: Update task
    delete:
      tags: [Tasks]
      summary: Delete task

  /comments/task/{taskId}:
    get:
      tags: [Comments]
      summary: Get comments for task

  /comments:
    post:
      tags: [Comments]
      summary: Post comment

  /comments/{id}:
    put:
      tags: [Comments]
      summary: Edit comment
    delete:
      tags: [Comments]
      summary: Delete comment

  /comments/{commentId}/replies:
    get:
      tags: [Comments]
      summary: Get comment replies

  /notifications:
    get:
      tags: [Notifications]
      summary: Get notifications
    post:
      tags: [Notifications]
      summary: Create notification

  /notifications/unread-count:
    get:
      tags: [Notifications]
      summary: Get unread count

  /notifications/{id}/read:
    put:
      tags: [Notifications]
      summary: Mark notification as read

  /notifications/mark-all-read:
    put:
      tags: [Notifications]
      summary: Mark all notifications as read

  /transactions:
    post:
      tags: [Transactions]
      summary: Create transaction

  /transactions/{id}:
    put:
      tags: [Transactions]
      summary: Update transaction
    delete:
      tags: [Transactions]
      summary: Delete transaction

  /transactions/project/{projectId}:
    get:
      tags: [Transactions]
      summary: Get project transactions

  /transactions/project/{projectId}/summary:
    get:
      tags: [Transactions]
      summary: Get financial summary

  /employees:
    get:
      tags: [Employees]
      summary: Get employees
    post:
      tags: [Employees]
      summary: Create employee

  /employees/{id}:
    get:
      tags: [Employees]
      summary: Get employee
    put:
      tags: [Employees]
      summary: Update employee
    delete:
      tags: [Employees]
      summary: Delete employee

  /employees/project/{projectId}:
    get:
      tags: [Employees]
      summary: Get employees by project

  /attendance/record:
    post:
      tags: [Attendance]
      summary: Record attendance

  /attendance/project/{projectId}/date/{date}:
    get:
      tags: [Attendance]
      summary: Get attendance by date

  /attendance/project/{projectId}/range:
    get:
      tags: [Attendance]
      summary: Get attendance by range

  /attendance/project/{projectId}/summary:
    get:
      tags: [Attendance]
      summary: Get attendance summary

  /push/vapid-public-key:
    get:
      tags: [Push]
      summary: Get VAPID public key
      security: []

  /push/subscribe:
    post:
      tags: [Push]
      summary: Subscribe to push notifications

  /push/unsubscribe:
    post:
      tags: [Push]
      summary: Unsubscribe from push notifications

  /push/subscription-status:
    get:
      tags: [Push]
      summary: Get subscription status

  /push/test-notification:
    post:
      tags: [Push]
      summary: Send test notification

  /health:
    get:
      tags: [System]
      summary: Server health check

  /health/db:
    get:
      tags: [System]
      summary: Database health check
