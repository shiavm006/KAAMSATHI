const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
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
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  data: {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    url: String,
    actionText: String,
    actionUrl: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 });

// Pre-save middleware to update readAt
notificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, limit = 20, skip = 0) {
  return this.find({
    recipient: userId,
    isDeleted: false,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  })
  .populate('sender', 'name avatar')
  .populate('data.jobId', 'title companyName')
  .sort({ priority: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId, notificationIds = null) {
  const query = {
    recipient: userId,
    isRead: false
  };

  if (notificationIds) {
    query._id = { $in: notificationIds };
  }

  return this.updateMany(query, {
    isRead: true,
    readAt: new Date()
  });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isDeleted: false,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  });
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create(data);
};

// Static method to create job application notification
notificationSchema.statics.createJobApplicationNotification = function(jobId, applicantId, employerId) {
  return this.create({
    recipient: employerId,
    sender: applicantId,
    type: 'job_application',
    title: 'New Job Application',
    message: 'You have received a new application for your job posting',
    data: {
      jobId,
      actionText: 'View Application',
      actionUrl: `/applications/${jobId}`
    }
  });
};

// Static method to create application status notification
notificationSchema.statics.createApplicationStatusNotification = function(applicationId, applicantId, employerId, status) {
  const statusMessages = {
    'shortlisted': 'Your application has been shortlisted!',
    'interview-scheduled': 'Interview has been scheduled for your application',
    'offered': 'Congratulations! You have been offered the job',
    'rejected': 'Your application was not selected for this position'
  };

  return this.create({
    recipient: applicantId,
    sender: employerId,
    type: 'application_status_change',
    title: 'Application Status Updated',
    message: statusMessages[status] || 'Your application status has been updated',
    data: {
      applicationId,
      actionText: 'View Details',
      actionUrl: `/applications/${applicationId}`
    }
  });
};

// Static method to create message notification
notificationSchema.statics.createMessageNotification = function(senderId, receiverId, messageId) {
  return this.create({
    recipient: receiverId,
    sender: senderId,
    type: 'message_received',
    title: 'New Message',
    message: 'You have received a new message',
    data: {
      messageId,
      actionText: 'View Message',
      actionUrl: `/messages/${senderId}`
    }
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 