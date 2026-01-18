const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  tagline: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  eventImage: {
    type: String,
    default: ''
  },
  fees: {
    type: Number,
    default: 0,
    min: 0
  },
  prizes: {
    type: String,
    default: ''
  },
  groupMinParticipants: {
    type: Number,
    required: [true, 'Minimum participants is required'],
    min: 1
  },
  groupMaxParticipants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: 1
  },
  eventLocation: {
    type: String,
    default: ''
  },
  maxGroupsAllowed: {
    type: Number,
    required: [true, 'Maximum groups allowed is required'],
    min: 1
  },
  coordinatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  studentCoordinatorName: {
    type: String,
    default: ''
  },
  studentCoordinatorPhone: {
    type: String,
    default: ''
  },
  studentCoordinatorEmail: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  modifiedAt: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Validation: min participants should be less than or equal to max
eventSchema.pre('save', function(next) {
  if (this.groupMinParticipants > this.groupMaxParticipants) {
    next(new Error('Minimum participants cannot be greater than maximum participants'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);