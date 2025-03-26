const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide project name'],
    trim: true,
    maxlength: [100, 'Project name cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide project description'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  assignedUsers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);