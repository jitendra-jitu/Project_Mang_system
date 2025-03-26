const express = require('express');
const {
  getProjects,
  getProject,
  addProject,
  updateProject,
  deleteProject,
  getProjectTasks
} = require('../controllers/projectController');
const { createTask } = require('../controllers/taskController');

const Project = require('../models/Project');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

router.use(protect);

router.route('/')
  .get(
    advancedResults(Project, [
      { path: 'assignedUsers', select: 'name email role' },
      { path: 'createdBy', select: 'name email' }
    ]),
    getProjects
  )
  .post(authorize('admin'), addProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

// Project tasks routes
router.route('/:projectId/tasks')
  .get(getProjectTasks)
  .post(createTask);

module.exports = router;