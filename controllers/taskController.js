const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// Controller functions
const getTasks = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role === 'admin') {
    query = Task.find();
  } else {
    query = Task.find({
      $or: [
        { assignedUser: req.user.id },
        { createdBy: req.user.id }
      ]
    });
  }

  const tasks = await query
    .populate({
      path: 'project',
      select: 'name description'
    })
    .populate({
      path: 'assignedUser',
      select: 'name email'
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

const getProjectTasks = asyncHandler(async (req, res, next) => {
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
      new ErrorResponse(`Not authorized to access tasks for this project`, 401)
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

const getUserTasks = asyncHandler(async (req, res, next) => {
  if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to access tasks for this user`, 401)
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

const getTask = asyncHandler(async (req, res, next) => {
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

  if (
    req.user.role !== 'admin' &&
    task.assignedUser._id.toString() !== req.user.id &&
    task.createdBy._id.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(`Not authorized to access this task`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

const createTask = asyncHandler(async (req, res, next) => {
  req.body.project = req.params.projectId;
  req.body.createdBy = req.user.id;

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
      new ErrorResponse(`Not authorized to add tasks to this project`, 401)
    );
  }

  if (
    !project.assignedUsers.some(
      user => user.toString() === req.body.assignedUser
    )
  ) {
    return next(
      new ErrorResponse(`The assigned user is not part of this project`, 400)
    );
  }

  if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
    return next(
      new ErrorResponse(`End date must be after start date`, 400)
    );
  }

  const task = await Task.create(req.body);

  res.status(201).json({
    success: true,
    data: task
  });
});

const updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  if (
    req.user.role !== 'admin' &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(`Not authorized to update this task`, 401)
    );
  }

  if (req.body.assignedUser) {
    const project = await Project.findById(task.project);
    if (
      !project.assignedUsers.some(
        user => user.toString() === req.body.assignedUser
      )
    ) {
      return next(
        new ErrorResponse(`The assigned user is not part of this project`, 400)
      );
    }
  }

  if (req.body.startDate || req.body.endDate) {
    const startDate = req.body.startDate ? new Date(req.body.startDate) : task.startDate;
    const endDate = req.body.endDate ? new Date(req.body.endDate) : task.endDate;

    if (startDate > endDate) {
      return next(
        new ErrorResponse(`End date must be after start date`, 400)
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

const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  if (
    req.user.role !== 'admin' &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(`Not authorized to delete this task`, 401)
    );
  }

  // Replace task.remove() with either:
  // Option 1: Using deleteOne()
  await Task.deleteOne({ _id: req.params.id });
  
  // OR Option 2: Using findByIdAndDelete()
  // await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

const updateTaskStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  if (
    task.assignedUser.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(`Not authorized to update this task's status`, 401)
    );
  }

  if (!['pending', 'in-progress', 'completed'].includes(status)) {
    return next(
      new ErrorResponse(`Invalid status value`, 400)
    );
  }

  task.status = status;
  await task.save();

  res.status(200).json({
    success: true,
    data: task
  });
});

// At the bottom of taskController.js
module.exports = {
  getTasks,
  getProjectTasks,
  getUserTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus
};