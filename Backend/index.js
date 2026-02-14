const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import configuration
const config = require('./src/config/config');

// Import database connection
const db = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const leadRoutes = require('./src/routes/leads');
const clientRoutes = require('./src/routes/clients');
const userRoutes = require('./src/routes/users');
const taskRoutes = require('./src/routes/tasks');
const commentRoutes = require('./src/routes/comments');
const notificationRoutes = require('./src/routes/notifications');
const pushRoutes = require('./src/routes/push');
const projectRoutes = require('./src/routes/projects');
const transactionRoutes = require('./src/routes/transactions');
const employeeRoutes = require('./src/routes/employees');
const attendanceRoutes = require('./src/routes/attendance');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : []
      : true, // Allow all in development
    credentials: true
  }
});
const PORT = config.server.port;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : []
    : true, // Allow all in development
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
console.log('Registering auth routes at /api/auth');
app.use('/api/auth', authRoutes);
console.log('Registering lead routes at /api/leads');
app.use('/api/leads', leadRoutes);
console.log('Registering client routes at /api/clients');
app.use('/api/clients', clientRoutes);
console.log('Registering user routes at /api/users');
app.use('/api/users', userRoutes);
console.log('Registering task routes at /api/tasks');
app.use('/api/tasks', taskRoutes);
console.log('Registering comment routes at /api/comments');
app.use('/api/comments', commentRoutes);
console.log('Registering notification routes at /api/notifications');
app.use('/api/notifications', notificationRoutes);
console.log('Registering push routes at /api/push');
app.use('/api/push', pushRoutes);
console.log('Registering project routes at /api/projects');
app.use('/api/projects', projectRoutes);
console.log('Registering transaction routes at /api/transactions');
app.use('/api/transactions', transactionRoutes);
console.log('Registering employee routes at /api/employees');
app.use('/api/employees', employeeRoutes);
console.log('Registering attendance routes at /api/attendance');
app.use('/api/attendance', attendanceRoutes);

console.log('All API routes registered successfully');

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Database health check route
app.get('/api/health/db', (req, res) => {
  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      console.error('Database health check failed:', err);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Database connection failed',
        error: err.message
      });
    }
    res.json({
      status: 'OK',
      message: 'Database connection successful',
      test: results[0]
    });
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  // Leave user-specific room
  socket.on('leave-user-room', (userId) => {
    socket.leave(`user_${userId}`);
    console.log(`User ${userId} left room user_${userId}`);
  });

  // Join task-specific room for comments
  socket.on('join-task-room', (taskId) => {
    socket.join(`task_${taskId}`);
    console.log(`User joined task room task_${taskId}`);
  });

  // Leave task-specific room
  socket.on('leave-task-room', (taskId) => {
    socket.leave(`task_${taskId}`);
    console.log(`User left task room task_${taskId}`);
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { taskId, userId, userName } = data;
    socket.to(`task_${taskId}`).emit('user-typing', {
      userId,
      userName,
      taskId,
      isTyping: true
    });
  });

  socket.on('typing-stop', (data) => {
    const { taskId, userId } = data;
    socket.to(`task_${taskId}`).emit('user-typing', {
      userId,
      taskId,
      isTyping: false
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible from controllers
global.io = io;

server.listen(PORT, config.server.host, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
