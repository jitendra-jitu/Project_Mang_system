const express = require('express');
const {
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus
} = require('../controllers/taskController');

const router = express.Router();
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// General task routes
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/status', updateTaskStatus);

module.exports = router;