// models/Institute.js
const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  instituteName: {
    type: String,
    required: [true, 'Institute name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  instituteImage: {
    type: String,
    default: ''
  },
  coordinatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

module.exports = mongoose.model('Institute', instituteSchema);