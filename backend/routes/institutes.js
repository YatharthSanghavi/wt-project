const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Institute = require('../models/Institute');
const Department = require('../models/Department');

router.get('/', async (req, res, next) => {
  try {
    const institutes = await Institute.find()
      .populate('coordinatorId', 'name email phone')
      .sort('-createdAt');

    res.json({
      success: true,
      count: institutes.length,
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

module.exports = router;