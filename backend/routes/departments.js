const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Department = require('../models/Department');
const Institute = require('../models/Institute');
const Event = require('../models/Event');

router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('instituteId', 'instituteName city')
      .populate('coordinatorId', 'name email phone')
      .sort('-createdAt');

    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('instituteId', 'instituteName city')
      .populate('coordinatorId', 'name email phone');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, authorize('admin', 'institute_coordinator'), async (req, res, next) => {
  try {
    const { departmentName, instituteId, departmentImage, description, coordinatorId } = req.body;

    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({
        success: false,
        message: 'Institute not found'
      });
    }

    if (req.user.role === 'institute_coordinator') {
      if (institute.coordinatorId && institute.coordinatorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create department for this institute'
        });
      }
    }

    const existingDept = await Department.findOne({ departmentName, instituteId });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists in this institute'
      });
    }

    const department = await Department.create({
      departmentName,
      instituteId,
      departmentImage,
      description,
      coordinatorId,
      modifiedBy: req.user._id
    });

    const populatedDepartment = await Department.findById(department._id)
      .populate('instituteId', 'instituteName city')
      .populate('coordinatorId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: populatedDepartment
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, authorize('admin', 'department_coordinator'), async (req, res, next) => {
  try {
    const { departmentName, instituteId, departmentImage, description, coordinatorId } = req.body;

    let department = await Department.findById(req.params.id);

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
          message: 'Not authorized to update this department'
        });
      }
    }

    department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        departmentName,
        instituteId,
        departmentImage,
        description,
        coordinatorId,
        modifiedAt: Date.now(),
        modifiedBy: req.user._id
      },
      { new: true, runValidators: true }
    )
      .populate('instituteId', 'instituteName city')
      .populate('coordinatorId', 'name email phone');

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const eventCount = await Event.countDocuments({ departmentId: req.params.id });
    if (eventCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with existing events'
      });
    }

    await department.deleteOne();

    res.json({
      success: true,
      message: 'Department deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;