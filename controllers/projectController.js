const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const advancedResults = require('../middleware/advancedResults');

// @desc      Get all projects
// @route     GET /api/v1/projects
// @route     GET /api/v1/users/:userId/projects
// @access    Private
const getProjects = asyncHandler(async (req, res, next) => {
    if (req.params.userId) {
        // If getting projects for a specific user
        const projects = await Project.find({ assignedUsers: req.params.userId })
            .populate({
                path: 'assignedUsers',
                select: 'name email role'
            })
            .populate({
                path: 'createdBy',
                select: 'name email'
            });

        return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    }

    // If getting all projects (using advancedResults)
    res.status(200).json(res.advancedResults);
});

// @desc      Get single project
// @route     GET /api/v1/projects/:id
// @access    Private
const getProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
        .populate({
            path: 'assignedUsers',
            select: 'name email role'
        })
        .populate({
            path: 'createdBy',
            select: 'name email'
        });

    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is assigned to project or is admin
    if (
        req.user.role !== 'admin' &&
        !project.assignedUsers.some(user => user._id.toString() === req.user.id)
    ) {
        return next(
            new ErrorResponse(`Not authorized to access this project`, 401)
        );
    }

    res.status(200).json({
        success: true,
        data: project
    });
});

// @desc      Create project
// @route     POST /api/v1/projects
// @access    Private/Admin
const addProject = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Check if assigned users exist and are not duplicated
    const assignedUsers = [...new Set(req.body.assignedUsers)]; // Remove duplicates
    const users = await User.find({ _id: { $in: assignedUsers } });

    if (users.length !== assignedUsers.length) {
        return next(new ErrorResponse(`One or more users not found`, 404));
    }

    const project = await Project.create({
        ...req.body,
        assignedUsers
    });

    res.status(201).json({
        success: true,
        data: project
    });
});

// @desc      Update project
// @route     PUT /api/v1/projects/:id
// @access    Private/Admin
const updateProject = asyncHandler(async (req, res, next) => {
    let project = await Project.findById(req.params.id);

    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
        );
    }

    // Check if assigned users exist and are not duplicated
    if (req.body.assignedUsers) {
        const assignedUsers = [...new Set(req.body.assignedUsers)]; // Remove duplicates
        const users = await User.find({ _id: { $in: assignedUsers } });

        if (users.length !== assignedUsers.length) {
            return next(new ErrorResponse(`One or more users not found`, 404));
        }
        req.body.assignedUsers = assignedUsers;
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: project
    });
});

// @desc      Delete project
// @route     DELETE /api/v1/projects/:id
// @access    Private/Admin
const deleteProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
        );
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });

    await Task.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc      Get tasks for a specific project
// @route     GET /api/v1/projects/:projectId/tasks
// @access    Private
const getProjectTasks = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.projectId}`, 404)
        );
    }

    // Check authorization
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

module.exports = {
    getProjects,
    getProject,
    addProject,
    updateProject,
    deleteProject,
    getProjectTasks
};