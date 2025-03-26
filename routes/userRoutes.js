const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserProjects
} = require('../controllers/userController');
const { getUserTasks } = require('../controllers/taskController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const advancedResults = require('../middleware/advancedResults');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// User projects route
router.route('/:userId/projects')
  .get(getUserProjects);

// User tasks route
router.route('/:userId/tasks')
  .get(getUserTasks);

module.exports = router;