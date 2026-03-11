const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const EventWiseWinner = require('../models/EventWiseWinner');
const Event = require('../models/Event');
const Group = require('../models/Group');

router.get('/events/:eventId/winners', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const winners = await EventWiseWinner.find({ eventId: req.params.eventId })
      .populate('eventId', 'eventName prizes')
      .populate({
        path: 'groupId',
        select: 'groupName',
        populate: { path: 'eventId', select: 'eventName' }
      })
      .sort('sequence');

    res.json({
      success: true,
      count: winners.length,
      data: winners
    });
  } catch (error) {
    next(error);
  }
});

router.post('/events/:eventId/winners', protect, authorize('admin', 'eventCoord'), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role === 'eventCoord') {
      if (event.coordinatorId && event.coordinatorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to declare winners for this event' });
      }
    }

    const { groupId, sequence } = req.body;

    if (!groupId || !sequence) {
      return res.status(400).json({ success: false, message: 'groupId and sequence are required' });
    }

    if (sequence < 1 || sequence > 3) {
      return res.status(400).json({ success: false, message: 'Sequence must be 1, 2, or 3' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    if (group.eventId.toString() !== req.params.eventId) {
      return res.status(400).json({ success: false, message: 'Group does not belong to this event' });
    }

    const existingWinner = await EventWiseWinner.findOne({
      eventId: req.params.eventId,
      sequence
    });
    if (existingWinner) {
      return res.status(400).json({
        success: false,
        message: `Position ${sequence} already declared for this event`
      });
    }

    const groupAlreadyWon = await EventWiseWinner.findOne({
      eventId: req.params.eventId,
      groupId
    });
    if (groupAlreadyWon) {
      return res.status(400).json({
        success: false,
        message: 'This group already has a winner position in this event'
      });
    }

    const winner = await EventWiseWinner.create({
      eventId: req.params.eventId,
      groupId,
      sequence,
      modifiedBy: req.user._id
    });

    const populatedWinner = await EventWiseWinner.findById(winner._id)
      .populate('eventId', 'eventName prizes')
      .populate('groupId', 'groupName');

    res.status(201).json({
      success: true,
      message: 'Winner declared successfully',
      data: populatedWinner
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/winners/:id', protect, authorize('admin', 'eventCoord'), async (req, res, next) => {
  try {
    let winner = await EventWiseWinner.findById(req.params.id);
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found' });
    }

    const { groupId, sequence } = req.body;

    if (sequence !== undefined) {
      if (sequence < 1 || sequence > 3) {
        return res.status(400).json({ success: false, message: 'Sequence must be 1, 2, or 3' });
      }
      const existing = await EventWiseWinner.findOne({
        eventId: winner.eventId,
        sequence,
        _id: { $ne: winner._id }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: `Position ${sequence} already taken` });
      }
    }

    if (groupId !== undefined) {
      const group = await Group.findById(groupId);
      if (!group || group.eventId.toString() !== winner.eventId.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid group for this event' });
      }
    }

    winner = await EventWiseWinner.findByIdAndUpdate(
      req.params.id,
      { ...req.body, modifiedAt: Date.now(), modifiedBy: req.user._id },
      { new: true, runValidators: true }
    )
      .populate('eventId', 'eventName prizes')
      .populate('groupId', 'groupName');

    res.json({ success: true, message: 'Winner updated successfully', data: winner });
  } catch (error) {
    next(error);
  }
});

router.delete('/winners/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const winner = await EventWiseWinner.findById(req.params.id);
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found' });
    }

    await winner.deleteOne();

    res.json({ success: true, message: 'Winner record deleted successfully', data: {} });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
