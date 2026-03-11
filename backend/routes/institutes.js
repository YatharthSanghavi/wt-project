const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Institute = require('../models/Institute');
const Department = require('../models/Department');

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { instituteName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 0;
    const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
    const total = await Institute.countDocuments(query);

    let institutesQuery = Institute.find(query)
      .populate('coordinatorId', 'name email phone')
      .sort('-createdAt');

    if (limitNum > 0) {
      institutesQuery = institutesQuery.skip(skip).limit(limitNum);
    }

    const institutes = await institutesQuery;

    res.json({
      success: true,
      count: institutes.length,
      total,
      page: pageNum,
      pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      data: institutes
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const institute = await Institute.findById(req.params.id)
      .populate('coordinatorId', 'name email phone');

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: 'Institute not found'
      });
    }

    res.json({
      success: true,
      data: institute
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/departments', async (req, res, next) => {
  try {
    const departments = await Department.find({ instituteId: req.params.id })
      .populate('coordinatorId', 'name email phone')
      .sort('departmentName');

    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { instituteName, city, instituteImage, coordinatorId } = req.body;

    const existingInstitute = await Institute.findOne({ instituteName, city });
    if (existingInstitute) {
      return res.status(400).json({
        success: false,
        message: 'Institute with this name already exists in this city'
      });
    }

    const institute = await Institute.create({
      instituteName,
      city,
      instituteImage,
      coordinatorId,
      modifiedBy: req.user._id
    });

    const populatedInstitute = await Institute.findById(institute._id)
      .populate('coordinatorId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Institute created successfully',
      data: populatedInstitute
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { instituteName, city, instituteImage, coordinatorId } = req.body;

    let institute = await Institute.findById(req.params.id);

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: 'Institute not found'
      });
    }

    institute = await Institute.findByIdAndUpdate(
      req.params.id,
      {
        instituteName,
        city,
        instituteImage,
        coordinatorId,
        modifiedAt: Date.now(),
        modifiedBy: req.user._id
      },
      { new: true, runValidators: true }
    ).populate('coordinatorId', 'name email phone');

    res.json({
      success: true,
      message: 'Institute updated successfully',
      data: institute
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const institute = await Institute.findById(req.params.id);

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: 'Institute not found'
      });
    }

    const departmentCount = await Department.countDocuments({ instituteId: req.params.id });
    if (departmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete institute with existing departments'
      });
    }

    await institute.deleteOne();

    res.json({
      success: true,
      message: 'Institute deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// Week 8: GET /api/institutes/:id/summary — reporting endpoint
router.get('/:id/summary', async (req, res, next) => {
  try {
    const institute = await Institute.findById(req.params.id);
    if (!institute) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    const Department = require('../models/Department');
    const Event = require('../models/Event');
    const Group = require('../models/Group');
    const Participant = require('../models/Participant');

    const departments = await Department.find({ instituteId: req.params.id });
    const departmentIds = departments.map(d => d._id);

    const events = await Event.find({ departmentId: { $in: departmentIds } });
    const eventIds = events.map(e => e._id);

    const groupCount = await Group.countDocuments({ eventId: { $in: eventIds } });
    const participantCount = await Participant.countDocuments({
      groupId: { $in: (await Group.find({ eventId: { $in: eventIds } })).map(g => g._id) }
    });

    res.json({
      success: true,
      data: {
        instituteName: institute.instituteName,
        totalDepartments: departments.length,
        totalEvents: events.length,
        totalGroups: groupCount,
        totalParticipants: participantCount
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;