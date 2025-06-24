const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const query = {
    status: 'active',
    isActive: true
  };

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by job type
  if (req.query.jobType) {
    query.jobType = req.query.jobType;
  }

  // Filter by experience level
  if (req.query.experienceLevel) {
    query.experienceLevel = req.query.experienceLevel;
  }

  // Filter by location
  if (req.query.city) {
    query['location.city'] = new RegExp(req.query.city, 'i');
  }

  if (req.query.state) {
    query['location.state'] = new RegExp(req.query.state, 'i');
  }

  // Filter by salary range
  if (req.query.minSalary) {
    query['salary.min'] = { $gte: parseInt(req.query.minSalary) };
  }

  if (req.query.maxSalary) {
    query['salary.max'] = { $lte: parseInt(req.query.maxSalary) };
  }

  // Search by title or description
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Filter by employer
  if (req.query.employer) {
    query.employer = req.query.employer;
  }

  // Filter by featured jobs
  if (req.query.featured === 'true') {
    query.isFeatured = true;
  }

  // Filter by urgent jobs
  if (req.query.urgent === 'true') {
    query.isUrgent = true;
  }

  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('employer', 'name companyName avatar')
    .skip(startIndex)
    .limit(limit)
    .sort({ 
      isFeatured: -1, 
      isUrgent: -1, 
      postedDate: -1 
    });

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
    count: jobs.length,
    pagination,
    data: jobs
  });
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id)
    .populate('employer', 'name companyName avatar employerProfile');

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Increment views if user is authenticated
  if (req.user) {
    await job.incrementViews();
  }

  res.status(200).json({
    success: true,
    data: job
  });
});

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res, next) => {
  // Add employer to req.body
  req.body.employer = req.user.id;

  // Set company name from user profile
  if (req.user.userType === 'employer' && req.user.employerProfile?.companyName) {
    req.body.companyName = req.user.employerProfile.companyName;
  }

  const job = await Job.create(req.body);

  // Update employer's total jobs posted
  if (req.user.userType === 'employer') {
    req.user.employerProfile.totalJobsPosted += 1;
    await req.user.save();
  }

  res.status(201).json({
    success: true,
    data: job
  });
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is job owner or admin
  if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this job`, 401));
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: job
  });
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is job owner or admin
  if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this job`, 401));
  }

  await job.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get jobs by employer
// @route   GET /api/jobs/employer/:employerId
// @access  Public
const getJobsByEmployer = asyncHandler(async (req, res, next) => {
  const jobs = await Job.find({ 
    employer: req.params.employerId,
    status: 'active',
    isActive: true
  }).populate('employer', 'name companyName avatar');

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

// @desc    Get jobs by category
// @route   GET /api/jobs/category/:category
// @access  Public
const getJobsByCategory = asyncHandler(async (req, res, next) => {
  const jobs = await Job.find({
    category: req.params.category,
    status: 'active',
    isActive: true
  }).populate('employer', 'name companyName avatar');

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

// @desc    Get jobs by location
// @route   GET /api/jobs/location/:city/:state
// @access  Public
const getJobsByLocation = asyncHandler(async (req, res, next) => {
  const jobs = await Job.find({
    'location.city': new RegExp(req.params.city, 'i'),
    'location.state': new RegExp(req.params.state, 'i'),
    status: 'active',
    isActive: true
  }).populate('employer', 'name companyName avatar');

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

// @desc    Search jobs
// @route   GET /api/jobs/search
// @access  Public
const searchJobs = asyncHandler(async (req, res, next) => {
  const { q, location, category, jobType, experienceLevel } = req.query;

  const query = {
    status: 'active',
    isActive: true
  };

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Location filter
  if (location) {
    query.$or = [
      { 'location.city': new RegExp(location, 'i') },
      { 'location.state': new RegExp(location, 'i') }
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Job type filter
  if (jobType) {
    query.jobType = jobType;
  }

  // Experience level filter
  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  const jobs = await Job.find(query)
    .populate('employer', 'name companyName avatar')
    .sort({ score: { $meta: 'textScore' }, postedDate: -1 });

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Private/Admin
const getJobStats = asyncHandler(async (req, res, next) => {
  const stats = await Job.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalApplications: { $sum: '$applications' }
      }
    }
  ]);

  const totalJobs = await Job.countDocuments();
  const activeJobs = await Job.countDocuments({ status: 'active', isActive: true });
  const featuredJobs = await Job.countDocuments({ isFeatured: true, status: 'active' });

  res.status(200).json({
    success: true,
    data: {
      stats,
      totalJobs,
      activeJobs,
      featuredJobs
    }
  });
});

// @desc    Toggle job status
// @route   PUT /api/jobs/:id/toggle-status
// @access  Private
const toggleJobStatus = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is job owner or admin
  if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this job`, 401));
  }

  // Toggle status
  job.status = job.status === 'active' ? 'paused' : 'active';
  await job.save();

  res.status(200).json({
    success: true,
    data: job
  });
});

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobsByEmployer,
  getJobsByCategory,
  getJobsByLocation,
  searchJobs,
  getJobStats,
  toggleJobStatus
}; 