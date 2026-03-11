const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Participant = require('../models/Participant');
const Group = require('../models/Group');
const Event = require('../models/Event');

router.get('/groups/:groupId/participants', async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const participants = await Participant.find({ groupId: req.params.groupId })
      .sort('name');

    res.json({
      success: true,
      count: participants.length,
      data: participants
    });
  } catch (error) {
    next(error);
  }
});

router.post('/groups/:groupId/participants', protect, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isOwner = group.createdBy && group.createdBy.toString() === req.user._id.toString();
    const isAdminOrCoord = ['admin', 'eventCoord', 'departmentCoord'].includes(req.user.role);
    if (!isOwner && !isAdminOrCoord) {
      return res.status(403).json({ success: false, message: 'Not authorized to add participants to this group' });
    }

    const event = await Event.findById(group.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const currentCount = await Participant.countDocuments({ groupId: req.params.groupId });
    if (currentCount >= event.groupMaxParticipants) {
      return res.status(400).json({
        success: false,
        message: `Maximum participants limit (${event.groupMaxParticipants}) reached for this group`
      });
    }

    const { name, enrollmentNumber, instituteName, city, phone, email, isGroupLeader } = req.body;

    if (isGroupLeader) {
      const existingLeader = await Participant.findOne({ groupId: req.params.groupId, isGroupLeader: true });
      if (existingLeader) {
        return res.status(400).json({
          success: false,
          message: 'Group already has a leader. Remove existing leader first.'
        });
      }
    }

    const participant = await Participant.create({
      groupId: req.params.groupId,
      name,
      enrollmentNumber,
      instituteName,
      city,
      phone,
      email,
      isGroupLeader: isGroupLeader || false,
      modifiedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Participant added successfully',
      data: participant
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/participants/:id', protect, async (req, res, next) => {
  try {
    let participant = await Participant.findById(req.params.id);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    const group = await Group.findById(participant.groupId);
    const isOwner = group && group.createdBy && group.createdBy.toString() === req.user._id.toString();
    const isAdminOrCoord = ['admin', 'eventCoord', 'departmentCoord'].includes(req.user.role);

    if (!isOwner && !isAdminOrCoord) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this participant' });
    }

    if (req.body.isGroupLeader === true) {
      const existingLeader = await Participant.findOne({
        groupId: participant.groupId,
        isGroupLeader: true,
        _id: { $ne: participant._id }
      });
      if (existingLeader) {
        return res.status(400).json({
          success: false,
          message: 'Group already has a leader. Remove existing leader first.'
        });
      }
    }

    const updates = { ...req.body, modifiedAt: Date.now(), modifiedBy: req.user._id };

    participant = await Participant.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, message: 'Participant updated successfully', data: participant });
  } catch (error) {
    next(error);
  }
});

router.delete('/participants/:id', protect, async (req, res, next) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    const group = await Group.findById(participant.groupId);
    const isOwner = group && group.createdBy && group.createdBy.toString() === req.user._id.toString();
    const isAdminOrCoord = ['admin', 'eventCoord', 'departmentCoord'].includes(req.user.role);

    if (!isOwner && !isAdminOrCoord) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove this participant' });
    }

    await participant.deleteOne();

    res.json({ success: true, message: 'Participant removed successfully', data: {} });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
