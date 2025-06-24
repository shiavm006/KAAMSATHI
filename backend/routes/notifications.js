const express = require('express');
const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
  updateNotification,
  getNotificationStats
} = require('../controllers/notificationController');

const { protect, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation schemas
const createNotificationSchema = {
  body: Joi.object({
    recipient: Joi.string().required(),
    type: Joi.string().valid(
      'job_application',
      'application_status_change',
      'interview_scheduled',
      'message_received',
      'job_posted',
      'profile_viewed',
      'system_announcement',
      'payment_received',
      'verification_required',
      'account_alert'
    ).required(),
    title: Joi.string().max(100).required(),
    message: Joi.string().max(500).required(),
    data: Joi.object({
      jobId: Joi.string(),
      applicationId: Joi.string(),
      messageId: Joi.string(),
      url: Joi.string().uri(),
      actionText: Joi.string(),
      actionUrl: Joi.string().uri()
    }),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
  })
};

const markAsReadSchema = {
  body: Joi.object({
    notificationIds: Joi.array().items(Joi.string()).optional()
  })
};

// Notification routes
router.route('/')
  .get(getNotifications)
  .post(authorizeRoles('admin'), validate(createNotificationSchema), createNotification);

router.route('/unread/count')
  .get(getUnreadCount);

router.route('/read')
  .put(validate(markAsReadSchema), markAsRead);

router.route('/read-all')
  .put(markAllAsRead);

router.route('/stats')
  .get(authorizeRoles('admin'), getNotificationStats);

router.route('/:id')
  .get(getNotification)
  .put(authorizeRoles('admin'), updateNotification)
  .delete(deleteNotification);

module.exports = router; 