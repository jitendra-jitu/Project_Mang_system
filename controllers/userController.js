const User = require('../models/User');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const advancedResults = require('../middleware/advancedResults');

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
const createUser = asyncHandler(async (req, res, next) => {
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(
      new ErrorResponse(`User with email ${req.body.email} already exists`, 400)
    );
  }

  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get projects for a specific user
// @route     GET /api/v1/users/:userId/projects
// @access    Private/Admin
const getUserProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find({ assignedUsers: req.params.userId })
    .populate({
      path: 'assignedUsers',
      select: 'name email role'
    })
    .populate({
      path: 'createdBy',
      select: 'name email'
    });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserProjects
};