const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { role, search } = req.query;
    
    let query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('instituteId', 'instituteName city')
      .populate('departmentId', 'departmentName')
      .sort('-createdAt');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('instituteId', 'instituteName city')
      .populate('departmentId', 'departmentName');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is accessing their own data or is admin
    if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/users/:id
// @desc    Update user
// @access  Private
router.patch('/:id', protect, async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is updating their own data or is admin
    if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Fields that can be updated
    const allowedFields = ['name', 'phone', 'instituteId', 'departmentId'];
    
    // Admin can also update role
    if (req.user.role === 'admin') {
      allowedFields.push('role');
    }

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('instituteId', 'instituteName city')
      .populate('departmentId', 'departmentName');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
