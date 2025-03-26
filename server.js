const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');

// Route files
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const projects = require('./routes/projectRoutes');
const tasks = require('./routes/taskRoutes');

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/projects', projects);
app.use('/api/v1/tasks', tasks);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});