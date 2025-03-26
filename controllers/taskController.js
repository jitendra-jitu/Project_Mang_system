const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const advancedResults = require('../middleware/advancedResults');

// @desc      Get all tasks
// @route     GET /api/v1/tasks
// @access    Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  // For general tasks route, only return tasks where user is assigned or is admin
  if (req.user.role === 'admin') {
    res.status(200).json(res.advancedResults);
  } else {
    const tasks = await Task.find({ assignedUser: req.user.id })
      .populate({
        path: 'project',
        select: 'name description'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  }
});

// @desc      Get tasks for a specific project
// @route     GET /api/v1/projects/:projectId/tasks
// @access    Private
exports.getProjectTasks = asyncHandler(async (req, res, next) => {
  // Check if user has access to this project
  const project = await Project.findById(req.params.projectId);
  
  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.projectId}`, 404)
    );
  }

  if (
    req.user.role !== 'admin' &&
    !project.assignedUsers.some(user => user.toString() === req.user.id)
  ) {
    return next(
      new ErrorResponse(
        `Not authorized to access tasks for this project`,
        401
      )
    );
  }

  const tasks = await Task.find({ project: req.params.projectId })
    .populate({
      path: 'assignedUser',
      select: 'name email'
    })
    .populate({
      path: 'project',
      select: 'name description'
    })
    .populate({
      path: 'createdBy',
      select: 'name email'
    });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// @desc      Get tasks for a specific user
// @route     GET /api/v1/users/:userId/tasks
// @access    Private
exports.getUserTasks = asyncHandler(async (req, res, next) => {
  // Check if user is requesting their own tasks or is admin
  if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Not authorized to access tasks for this user`,
        401
      )
    );
  }

  const tasks = await Task.find({ assignedUser: req.params.userId })
    .populate({
      path: 'project',
      select: 'name description'
    })
    .populate({
      path: 'createdBy',
      select: 'name email'
    });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// @desc      Get single task
// @route     GET /api/v1/tasks/:id
// @access    Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate({
      path: 'assignedUser',
      select: 'name email'
    })
    .populate({
      path: 'project',
      select: 'name description'
    })
    .populate({
      path: 'createdBy',
      select: 'name email'
    });

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is assigned to task, is admin, or created the task
  if (
    req.user.role !== 'admin' &&
    task.assignedUser._id.toString() !== req.user.id &&
    task.createdBy._id.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `Not authorized to access this task`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc      Create task
// @route     POST /api/v1/projects/:projectId/tasks
// @access    Private
exports.addTask = asyncHandler(async (req, res, next) => {
  req.body.project = req.params.projectId;
  req.body.createdBy = req.user.id;

  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.projectId}`, 404)
    );
  }

  // Check if user has access to this project
  if (
    req.user.role !== 'admin' &&
    !project.assignedUsers.some(user => user.toString() === req.user.id)
  ) {
    return next(
      new ErrorResponse(
        `Not authorized to add tasks to this project`,
        401
      )
    );
  }

  // Check if assigned user is part of the project
  if (
    !project.assignedUsers.some(
      user => user.toString() === req.body.assignedUser
    )
  ) {
    return next(
      new ErrorResponse(
        `The assigned user is not part of this project`,
        400
      )
    );
  }

  // Validate dates
  if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
    return next(
      new ErrorResponse(
        `End date must be after start date`,
        400
      )
    );
  }

  const task = await Task.create(req.body);

  res.status(201).json({
    success: true,
    data: task
  });
});

// @desc      Update task
// @route     PUT /api/v1/tasks/:id
// @access    Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is admin or created the task
  if (
    req.user.role !== 'admin' &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `Not authorized to update this task`,
        401
      )
    );
  }

  // If assigned user is being updated, verify they're part of the project
  if (req.body.assignedUser) {
    const project = await Project.findById(task.project);
    if (
      !project.assignedUsers.some(
        user => user.toString() === req.body.assignedUser
      )
    ) {
      return next(
        new ErrorResponse(
          `The assigned user is not part of this project`,
          400
        )
      );
    }
  }

  // Validate dates if being updated
  if (req.body.startDate || req.body.endDate) {
    const startDate = req.body.startDate ? new Date(req.body.startDate) : task.startDate;
    const endDate = req.body.endDate ? new Date(req.body.endDate) : task.endDate;

    if (startDate > endDate) {
      return next(
        new ErrorResponse(
          `End date must be after start date`,
          400
        )
      );
    }
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc      Delete task
// @route     DELETE /api/v1/tasks/:id
// @access    Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is admin or created the task
  if (
    req.user.role !== 'admin' &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `Not authorized to delete this task`,
        401
      )
    );
  }

  await task.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Update task status
// @route     PUT /api/v1/tasks/:id/status
// @access    Private
exports.updateTaskStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if the user is assigned to the task or is admin
  if (
    task.assignedUser.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `Not authorized to update this task's status`,
        401
      )
    );
  }

  // Validate status
  if (!['pending', 'in-progress', 'completed'].includes(status)) {
    return next(
      new ErrorResponse(
        `Invalid status value. Must be one of: pending, in-progress, completed`,
        400
      )
    );
  }

  task.status = status;
  await task.save();

  res.status(200).json({
    success: true,
    data: task
  });
});