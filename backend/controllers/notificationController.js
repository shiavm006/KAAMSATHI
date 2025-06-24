const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const notifications = await Notification.getUserNotifications(
    req.user.id,
    limit,
    startIndex
  );

  const total = await Notification.countDocuments({
    recipient: req.user.id,
    isDeleted: false,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    data: notifications
  });
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
const getNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id)
    .populate('sender', 'name avatar userType')
    .populate('data.jobId', 'title companyName');

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  // Check if user is the recipient
  if (notification.recipient.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to view this notification', 401));
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
const markAsRead = asyncHandler(async (req, res, next) => {
  const { notificationIds } = req.body;

  await Notification.markAsRead(req.user.id, notificationIds);

  res.status(200).json({
    success: true,
    message: 'Notifications marked as read'
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.markAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  // Check if user is the recipient
  if (notification.recipient.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this notification', 401));
  }

  notification.isDeleted = true;
  notification.deletedAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread/count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: { unreadCount: count }
  });
});

// @desc    Create notification (admin only)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = asyncHandler(async (req, res, next) => {
  const { recipient, type, title, message, data, priority = 'medium' } = req.body;

  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    data,
    priority
  });

  await notification.populate('recipient', 'name email');

  res.status(201).json({
    success: true,
    data: notification
  });
});

// @desc    Update notification
// @route   PUT /api/notifications/:id
// @access  Private/Admin
const updateNotification = asyncHandler(async (req, res, next) => {
  let notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  notification = await Notification.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private/Admin
const getNotificationStats = asyncHandler(async (req, res, next) => {
  const stats = await Notification.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unreadCount: {
          $sum: {
            $cond: ['$isRead', 0, 1]
          }
        }
      }
    }
  ]);

  const totalNotifications = await Notification.countDocuments();
  const unreadNotifications = await Notification.getUnreadCount();

  res.status(200).json({
    success: true,
    data: {
      stats,
      totalNotifications,
      unreadNotifications
    }
  });
});

module.exports = {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
  updateNotification,
  getNotificationStats
}; 