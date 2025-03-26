const express = require('express');
const {
  getTasks,
  getTask,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getProjectTasks,
  getUserTasks
} = require('../controllers/taskController');

const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');

router.use(protect);

// Regular task routes
router.route('/')
  .get(getTasks);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/status')
  .put(updateTaskStatus);

// Project-specific task routes
router.route('/projects/:projectId/tasks')
  .get(getProjectTasks)
  .post(addTask);

// User-specific task routes
router.route('/users/:userId/tasks')
  .get(getUserTasks);

module.exports = router;