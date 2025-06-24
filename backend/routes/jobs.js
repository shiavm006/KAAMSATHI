const express = require('express');
const {
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
} = require('../controllers/jobController');

const { protect, authorize, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/')
  .get(getJobs);

router.route('/search')
  .get(searchJobs);

router.route('/category/:category')
  .get(getJobsByCategory);

router.route('/location/:city/:state')
  .get(getJobsByLocation);

router.route('/employer/:employerId')
  .get(getJobsByEmployer);

router.route('/:id')
  .get(getJob);

// Protected routes
router.use(protect);

// Employer only routes
router.route('/')
  .post(authorize('employer'), createJob);

router.route('/:id')
  .put(authorize('employer'), updateJob)
  .delete(authorize('employer'), deleteJob);

router.route('/:id/toggle-status')
  .put(authorize('employer'), toggleJobStatus);

// Admin only routes
router.route('/stats')
  .get(authorizeRoles('admin'), getJobStats);

module.exports = router; 