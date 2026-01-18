// models/EventWiseWinner.js
const mongoose = require('mongoose');

const eventWiseWinnerSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group is required']
  },
  sequence: {
    type: Number,
    required: [true, 'Sequence is required'],
    min: 1,
    max: 3
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

eventWiseWinnerSchema.index({ eventId: 1, sequence: 1 }, { unique: true });

module.exports = mongoose.model('EventWiseWinner', eventWiseWinnerSchema);