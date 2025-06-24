const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  const query = {};

  // Filter by user type
  if (req.query.userType) {
    query.userType = req.query.userType;
  }

  // Filter by status
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  // Search by name or email
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: users.length,
    pagination,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is user owner or admin
  if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this user`, 401));
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    bio: req.body.bio,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    location: req.body.location,
    avatar: req.body.avatar
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update worker profile
// @route   PUT /api/users/worker-profile
// @access  Private
const updateWorkerProfile = asyncHandler(async (req, res, next) => {
  if (req.user.userType !== 'worker') {
    return next(new ErrorResponse('Only workers can update worker profile', 403));
  }

  const workerFields = {
    'workerProfile.skills': req.body.skills,
    'workerProfile.experience': req.body.experience,
    'workerProfile.hourlyRate': req.body.hourlyRate,
    'workerProfile.availability': req.body.availability,
    'workerProfile.specializations': req.body.specializations,
    'workerProfile.languages': req.body.languages
  };

  // Remove undefined fields
  Object.keys(workerFields).forEach(key => 
    workerFields[key] === undefined && delete workerFields[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, workerFields, {
    new: true,
    runValidators: true
  });

  // Mark profile as complete
  if (!user.isProfileComplete) {
    user.isProfileComplete = true;
    await user.save();
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update employer profile
// @route   PUT /api/users/employer-profile
// @access  Private
const updateEmployerProfile = asyncHandler(async (req, res, next) => {
  if (req.user.userType !== 'employer') {
    return next(new ErrorResponse('Only employers can update employer profile', 403));
  }

  const employerFields = {
    'employerProfile.companyName': req.body.companyName,
    'employerProfile.companyType': req.body.companyType,
    'employerProfile.industry': req.body.industry,
    'employerProfile.companySize': req.body.companySize,
    'employerProfile.website': req.body.website,
    'employerProfile.description': req.body.description,
    'employerProfile.address': req.body.address
  };

  // Remove undefined fields
  Object.keys(employerFields).forEach(key => 
    employerFields[key] === undefined && delete employerFields[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, employerFields, {
    new: true,
    runValidators: true
  });

  // Mark profile as complete
  if (!user.isProfileComplete) {
    user.isProfileComplete = true;
    await user.save();
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Upload user documents
// @route   PUT /api/users/documents
// @access  Private
const uploadDocuments = asyncHandler(async (req, res, next) => {
  const { documentType, documentUrl } = req.body;

  if (!documentType || !documentUrl) {
    return next(new ErrorResponse('Please provide document type and URL', 400));
  }

  const user = await User.findById(req.user.id);

  const document = {
    type: documentType,
    url: documentUrl,
    uploadedAt: new Date()
  };

  if (req.user.userType === 'worker') {
    user.workerProfile.documents.push(document);
  } else if (req.user.userType === 'employer') {
    user.employerProfile.documents.push(document);
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$userType',
        count: { $sum: 1 },
        verifiedUsers: {
          $sum: {
            $cond: [{ $and: ['$isPhoneVerified', '$isEmailVerified'] }, 1, 0]
          }
        }
      }
    }
  ]);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });

  res.status(200).json({
    success: true,
    data: {
      stats,
      totalUsers,
      activeUsers
    }
  });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  updateWorkerProfile,
  updateEmployerProfile,
  uploadDocuments,
  getUserStats
}; 