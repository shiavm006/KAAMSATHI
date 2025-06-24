const express = require('express');
const {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
  addMessage,
  markMessagesAsRead,
  withdrawApplication,
  scheduleInterview,
  getApplicationStats
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Application routes
router.route('/')
  .get(getApplications)
  .post(authorize('worker'), createApplication);

router.route('/stats')
  .get(getApplicationStats);

router.route('/:id')
  .get(getApplication);

router.route('/:id/status')
  .put(authorize('employer'), updateApplicationStatus);

router.route('/:id/messages')
  .post(addMessage);

router.route('/:id/messages/read')
  .put(markMessagesAsRead);

router.route('/:id/withdraw')
  .put(authorize('worker'), withdrawApplication);

router.route('/:id/interview')
  .post(authorize('employer'), scheduleInterview);

module.exports = router; 