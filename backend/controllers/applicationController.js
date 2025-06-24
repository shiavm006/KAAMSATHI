const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
const getApplications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  let query = {};

  // Filter by user type
  if (req.user.userType === 'worker') {
    query.applicant = req.user.id;
  } else if (req.user.userType === 'employer') {
    query.employer = req.user.id;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by job
  if (req.query.job) {
    query.job = req.query.job;
  }

  const total = await Application.countDocuments(query);
  const applications = await Application.find(query)
    .populate('job', 'title companyName location salary category')
    .populate('applicant', 'name email phone avatar')
    .populate('employer', 'name companyName avatar')
    .skip(startIndex)
    .limit(limit)
    .sort({ appliedAt: -1 });

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
    count: applications.length,
    pagination,
    data: applications
  });
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate('job', 'title companyName location salary category description')
    .populate('applicant', 'name email phone avatar workerProfile')
    .populate('employer', 'name companyName avatar employerProfile');

  if (!application) {
    return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
  }

  // Check if user is authorized to view this application
  if (application.applicant.toString() !== req.user.id && 
      application.employer.toString() !== req.user.id && 
      req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to view this application`, 401));
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
const createApplication = asyncHandler(async (req, res, next) => {
  // Check if user is a worker
  if (req.user.userType !== 'worker') {
    return next(new ErrorResponse('Only workers can apply for jobs', 403));
  }

  const { jobId, coverLetter, expectedSalary, availability, workSchedule, relevantSkills, relevantExperience } = req.body;

  // Check if job exists and is active
  const job = await Job.findById(jobId);
  if (!job) {
    return next(new ErrorResponse('Job not found', 404));
  }

  if (job.status !== 'active' || !job.isActive) {
    return next(new ErrorResponse('This job is not available for applications', 400));
  }

  // Check if job is full
  if (job.isFull) {
    return next(new ErrorResponse('This job has reached maximum applications', 400));
  }

  // Check if user has already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: req.user.id
  });

  if (existingApplication) {
    return next(new ErrorResponse('You have already applied for this job', 400));
  }

  // Create application
  const application = await Application.create({
    job: jobId,
    applicant: req.user.id,
    employer: job.employer,
    coverLetter,
    expectedSalary,
    availability,
    workSchedule,
    relevantSkills,
    relevantExperience
  });

  // Increment job applications count
  await job.incrementApplications();

  // Populate the application with job and user details
  await application.populate('job', 'title companyName location salary category');
  await application.populate('applicant', 'name email phone avatar');
  await application.populate('employer', 'name companyName avatar');

  res.status(201).json({
    success: true,
    data: application
  });
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private
const updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status, reason, notes } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
  }

  // Check if user is authorized to update this application
  if (application.employer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this application`, 401));
  }

  // Update status
  await application.updateStatus(status, reason, notes);

  // If application is rejected or withdrawn, decrement job applications count
  if (['rejected', 'withdrawn'].includes(status)) {
    const job = await Job.findById(application.job);
    if (job) {
      await job.decrementApplications();
    }
  }

  // Populate the application
  await application.populate('job', 'title companyName location salary category');
  await application.populate('applicant', 'name email phone avatar');
  await application.populate('employer', 'name companyName avatar');

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Add message to application
// @route   POST /api/applications/:id/messages
// @access  Private
const addMessage = asyncHandler(async (req, res, next) => {
  const { message, attachments } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
  }

  // Check if user is authorized to add messages
  if (application.applicant.toString() !== req.user.id && 
      application.employer.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to add messages to this application`, 401));
  }

  // Add message
  await application.addMessage(req.user.id, message, attachments);

  // Populate the application
  await application.populate('job', 'title companyName location salary category');
  await application.populate('applicant', 'name email phone avatar');
  await application.populate('employer', 'name companyName avatar');

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Mark messages as read
// @route   PUT /api/applications/:id/messages/read
// @access  Private
const markMessagesAsRead = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
  }

  // Check if user is authorized
  if (application.applicant.toString() !== req.user.id && 
      application.employer.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to mark messages as read`, 401));
  }

  // Mark messages as read
  await application.markMessagesAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Messages marked as read'
  });
});

// @desc    Withdraw application
// @route   PUT /api/applications/:id/withdraw
// @access  Private
const withdrawApplication = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
  }

  // Check if user is the applicant
  if (application.applicant.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to withdraw this application`, 401));
  }

  // Check if application can be withdrawn
  if (!['applied', 'under-review', 'shortlisted'].includes(application.status)) {
    return next(new ErrorResponse('Application cannot be withdrawn at this stage', 400));
  }

  // Withdraw application
  await application.withdraw(reason);

  // Decrement job applications count
  const job = await Job.findById(application.job);
  if (job) {
    await job.decrementApplications();
  }

  res.status(200).json({
    success: true,
    message: 'Application withdrawn successfully'
  });
});

// @desc    Schedule interview
// @route   POST /api/applications/:id/interview
// @access  Private
const scheduleInterview = asyncHandler(async (req, res, next) => {
  const { scheduledAt, location, type, duration, notes } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
  }

  // Check if user is the employer
  if (application.employer.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to schedule interview`, 401));
  }

  // Update application with interview details
  application.interview = {
    scheduledAt,
    location,
    type,
    duration,
    interviewer: req.user.id,
    notes,
    status: 'scheduled'
  };

  // Update application status
  await application.updateStatus('interview-scheduled', 'Interview scheduled', notes);

  await application.save();

  // Populate the application
  await application.populate('job', 'title companyName location salary category');
  await application.populate('applicant', 'name email phone avatar');
  await application.populate('employer', 'name companyName avatar');

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Get application statistics
// @route   GET /api/applications/stats
// @access  Private
const getApplicationStats = asyncHandler(async (req, res, next) => {
  let matchQuery = {};

  // Filter by user type
  if (req.user.userType === 'worker') {
    matchQuery.applicant = req.user.id;
  } else if (req.user.userType === 'employer') {
    matchQuery.employer = req.user.id;
  }

  const stats = await Application.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalApplications = await Application.countDocuments(matchQuery);
  const pendingApplications = await Application.countDocuments({
    ...matchQuery,
    status: { $in: ['applied', 'under-review', 'shortlisted'] }
  });

  res.status(200).json({
    success: true,
    data: {
      stats,
      totalApplications,
      pendingApplications
    }
  });
});

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
  addMessage,
  markMessagesAsRead,
  withdrawApplication,
  scheduleInterview,
  getApplicationStats
}; 