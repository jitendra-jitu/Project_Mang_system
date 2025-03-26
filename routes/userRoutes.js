const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserProjects
} = require('../controllers/userController');

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

// Add this route for getting user's projects
router.route('/:userId/projects')
  .get(getUserProjects);

module.exports = router;