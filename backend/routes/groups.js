const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Participant = require('../models/Participant');

router.get('/events/:eventId/groups', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const groups = await Group.find({ eventId: req.params.eventId })
      .populate('eventId', 'eventName')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const participantCount = await Participant.countDocuments({ groupId: group._id });
        return { ...group.toObject(), participantCount };
      })
    );

    res.json({
      success: true,
      count: groupsWithCounts.length,
      data: groupsWithCounts
    });
  } catch (error) {
    next(error);
  }
});

router.post('/events/:eventId/groups', protect, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const currentGroupCount = await Group.countDocuments({ eventId: req.params.eventId });
    if (currentGroupCount >= event.maxGroupsAllowed) {
      return res.status(400).json({
        success: false,
        message: `Maximum groups limit (${event.maxGroupsAllowed}) reached for this event`
      });
    }

    const { groupName } = req.body;
    if (!groupName) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const group = await Group.create({
      groupName,
      eventId: req.params.eventId,
      createdBy: req.user._id,
      modifiedBy: req.user._id
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('eventId', 'eventName')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: populatedGroup
    });
  } catch (error) {
    next(error);
  }
});

// GET /groups/my — get all groups created by the current user
router.get('/groups/my', protect, async (req, res, next) => {
  try {
    const groups = await Group.find({ createdBy: req.user._id })
      .populate('eventId', 'eventName groupMinParticipants groupMaxParticipants fees eventLocation')
      .sort('-createdAt');

    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const participantCount = await Participant.countDocuments({ groupId: group._id });
        return { ...group.toObject(), participantCount };
      })
    );

    res.json({
      success: true,
      count: groupsWithCounts.length,
      data: groupsWithCounts
    });
  } catch (error) {
    next(error);
  }
});

router.get('/groups/:id', async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('eventId', 'eventName groupMinParticipants groupMaxParticipants')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const participants = await Participant.find({ groupId: group._id });

    res.json({
      success: true,
      data: { ...group.toObject(), participants, participantCount: participants.length }
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/groups/:id', protect, async (req, res, next) => {
  try {
    let group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isOwner = group.createdBy && group.createdBy.toString() === req.user._id.toString();
    const isAdminOrCoord = ['admin', 'eventCoord', 'departmentCoord'].includes(req.user.role);

    if (!isOwner && !isAdminOrCoord) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this group' });
    }

    const { groupName, isPaymentDone, isPresent } = req.body;
    const updates = { modifiedAt: Date.now(), modifiedBy: req.user._id };

    if (groupName !== undefined) updates.groupName = groupName;
    if (isAdminOrCoord) {
      if (isPaymentDone !== undefined) updates.isPaymentDone = isPaymentDone;
      if (isPresent !== undefined) updates.isPresent = isPresent;
    }

    group = await Group.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('eventId', 'eventName')
      .populate('createdBy', 'name email');

    res.json({ success: true, message: 'Group updated successfully', data: group });
  } catch (error) {
    next(error);
  }
});

router.delete('/groups/:id', protect, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isOwner = group.createdBy && group.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this group' });
    }

    await Participant.deleteMany({ groupId: group._id });
    await group.deleteOne();

    res.json({ success: true, message: 'Group and its participants deleted successfully', data: {} });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
