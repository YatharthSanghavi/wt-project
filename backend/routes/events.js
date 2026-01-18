const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Event = require('../models/Event');
const Department = require('../models/Department');
const Group = require('../models/Group');

router.get('/', async (req, res, next) => {
  try {
    const { department, search, location } = req.query;
    
    let query = {};

    if (department) {
      query.departmentId = department;
    }

    if (search) {
      query.eventName = { $regex: search, $options: 'i' };
    }

    if (location) {
      query.eventLocation = { $regex: location, $options: 'i' };
    }

    const events = await Event.find(query)
      .populate('departmentId', 'departmentName instituteId')
      .populate({
        path: 'departmentId',
        populate: {
          path: 'instituteId',
          select: 'instituteName city'
        }
      })
      .populate('coordinatorId', 'name email phone')
      .sort('-createdAt');

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('departmentId', 'departmentName instituteId')
      .populate({
        path: 'departmentId',
        populate: {
          path: 'instituteId',
          select: 'instituteName city'
        }
      })
      .populate('coordinatorId', 'name email phone');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const groupCount = await Group.countDocuments({ eventId: req.params.id });

    res.json({
      success: true,
      data: {
        ...event.toObject(),
        registeredGroups: groupCount,
        spotsRemaining: event.maxGroupsAllowed - groupCount
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/department/:departmentId', async (req, res, next) => {
  try {
    const events = await Event.find({ departmentId: req.params.departmentId })
      .populate('coordinatorId', 'name email phone')
      .sort('eventName');

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, authorize('admin', 'department_coordinator'), async (req, res, next) => {
  try {
    const {
      eventName,
      tagline,
      description,
      departmentId,
      eventImage,
      fees,
      prizes,
      groupMinParticipants,
      groupMaxParticipants,
      eventLocation,
      maxGroupsAllowed,
      coordinatorId,
      studentCoordinatorName,
      studentCoordinatorPhone,
      studentCoordinatorEmail
    } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (req.user.role === 'department_coordinator') {
      if (department.coordinatorId && department.coordinatorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create event for this department'
        });
      }
    }

    if (groupMinParticipants > groupMaxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Minimum participants cannot be greater than maximum participants'
      });
    }

    if (groupMinParticipants < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum participants must be at least 1'
      });
    }

    if (maxGroupsAllowed < 1) {
      return res.status(400).json({
        success: false,
        message: 'Maximum groups allowed must be at least 1'
      });
    }

    const event = await Event.create({
      eventName,
      tagline,
      description,
      departmentId,
      eventImage,
      fees,
      prizes,
      groupMinParticipants,
      groupMaxParticipants,
      eventLocation,
      maxGroupsAllowed,
      coordinatorId,
      studentCoordinatorName,
      studentCoordinatorPhone,
      studentCoordinatorEmail,
      modifiedBy: req.user._id
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('departmentId', 'departmentName instituteId')
      .populate({
        path: 'departmentId',
        populate: {
          path: 'instituteId',
          select: 'instituteName city'
        }
      })
      .populate('coordinatorId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, authorize('admin', 'event_coordinator', 'department_coordinator'), async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (req.user.role === 'event_coordinator') {
      if (event.coordinatorId && event.coordinatorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this event'
        });
      }
    }

    if (req.body.groupMinParticipants || req.body.groupMaxParticipants) {
      const minPart = req.body.groupMinParticipants || event.groupMinParticipants;
      const maxPart = req.body.groupMaxParticipants || event.groupMaxParticipants;

      if (minPart > maxPart) {
        return res.status(400).json({
          success: false,
          message: 'Minimum participants cannot be greater than maximum participants'
        });
      }

      if (minPart < 1) {
        return res.status(400).json({
          success: false,
          message: 'Minimum participants must be at least 1'
        });
      }
    }

    if (req.body.maxGroupsAllowed && req.body.maxGroupsAllowed < 1) {
      return res.status(400).json({
        success: false,
        message: 'Maximum groups allowed must be at least 1'
      });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        modifiedAt: Date.now(),
        modifiedBy: req.user._id
      },
      { new: true, runValidators: true }
    )
      .populate('departmentId', 'departmentName instituteId')
      .populate({
        path: 'departmentId',
        populate: {
          path: 'instituteId',
          select: 'instituteName city'
        }
      })
      .populate('coordinatorId', 'name email phone');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const groupCount = await Group.countDocuments({ eventId: req.params.id });
    if (groupCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event with ${groupCount} registered group(s). Please remove all groups first.`
      });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/summary', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const groups = await Group.find({ eventId: req.params.id });
    const groupIds = groups.map(g => g._id);

    const Participant = require('../models/Participant');
    const totalParticipants = await Participant.countDocuments({ groupId: { $in: groupIds } });
    const paidGroups = groups.filter(g => g.isPaymentDone).length;
    const presentGroups = groups.filter(g => g.isPresent).length;

    res.json({
      success: true,
      data: {
        eventName: event.eventName,
        totalGroups: groups.length,
        totalParticipants,
        paidGroups,
        presentGroups,
        maxGroupsAllowed: event.maxGroupsAllowed,
        spotsRemaining: event.maxGroupsAllowed - groups.length,
        fees: event.fees,
        prizes: event.prizes
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;