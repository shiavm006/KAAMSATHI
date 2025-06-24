const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Basic Application Information
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Application Details
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot be more than 1000 characters']
  },
  expectedSalary: {
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    isNegotiable: {
      type: Boolean,
      default: true
    }
  },
  availability: {
    type: String,
    enum: ['immediate', 'within-a-week', 'within-a-month', 'specific-date'],
    required: true
  },
  availableFrom: Date,
  workSchedule: {
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    preferredHours: {
      start: String,
      end: String
    },
    isFlexible: {
      type: Boolean,
      default: true
    }
  },

  // Skills and Experience
  relevantSkills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert']
    },
    yearsOfExperience: Number
  }],
  relevantExperience: {
    years: Number,
    description: String
  },
  certifications: [{
    name: String,
    issuingAuthority: String,
    issueDate: Date,
    expiryDate: Date,
    documentUrl: String
  }],

  // Documents and Attachments
  resume: {
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  additionalDocuments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  portfolio: {
    url: String,
    description: String
  },

  // Application Status
  status: {
    type: String,
    enum: [
      'applied',
      'under-review',
      'shortlisted',
      'interview-scheduled',
      'interviewed',
      'offered',
      'hired',
      'rejected',
      'withdrawn',
      'expired'
    ],
    default: 'applied'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'applied',
        'under-review',
        'shortlisted',
        'interview-scheduled',
        'interviewed',
        'offered',
        'hired',
        'rejected',
        'withdrawn',
        'expired'
      ]
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    notes: String
  }],

  // Evaluation and Feedback
  evaluation: {
    skills: {
      type: Number,
      min: 1,
      max: 5
    },
    experience: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String,
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evaluatedAt: Date
  },

  // Interview Information
  interview: {
    scheduledAt: Date,
    location: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical']
    },
    duration: Number, // in minutes
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    feedback: String
  },

  // Offer Information
  offer: {
    salary: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      type: {
        type: String,
        enum: ['hourly', 'daily', 'monthly', 'project-based']
      }
    },
    benefits: [String],
    startDate: Date,
    terms: String,
    offeredAt: Date,
    expiresAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending'
    },
    responseAt: Date,
    responseNotes: String
  },

  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  }],

  // Flags and Metadata
  isWithdrawn: {
    type: Boolean,
    default: false
  },
  withdrawnAt: Date,
  withdrawnReason: String,
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Timestamps
  appliedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ status: 1, appliedAt: -1 });

// Virtual for isActive
applicationSchema.virtual('isActive').get(function() {
  return !['rejected', 'withdrawn', 'expired', 'hired'].includes(this.status);
});

// Virtual for isPending
applicationSchema.virtual('isPending').get(function() {
  return ['applied', 'under-review', 'shortlisted'].includes(this.status);
});

// Virtual for isInProgress
applicationSchema.virtual('isInProgress').get(function() {
  return ['interview-scheduled', 'interviewed', 'offered'].includes(this.status);
});

// Virtual for daysSinceApplied
applicationSchema.virtual('daysSinceApplied').get(function() {
  const now = new Date();
  const applied = new Date(this.appliedAt);
  const diffTime = Math.abs(now - applied);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update lastUpdated
applicationSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Pre-save middleware to update status history
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this.employer // Assuming employer changes status
    });
  }
  next();
});

// Static method to find applications by job
applicationSchema.statics.findByJob = function(jobId) {
  return this.find({ job: jobId }).populate('applicant', 'name email phone avatar');
};

// Static method to find applications by applicant
applicationSchema.statics.findByApplicant = function(applicantId) {
  return this.find({ applicant: applicantId })
    .populate('job', 'title companyName location salary category')
    .populate('employer', 'name companyName');
};

// Static method to find applications by employer
applicationSchema.statics.findByEmployer = function(employerId) {
  return this.find({ employer: employerId })
    .populate('job', 'title category location')
    .populate('applicant', 'name email phone avatar');
};

// Instance method to update status
applicationSchema.methods.updateStatus = function(newStatus, reason = '', notes = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    reason: reason,
    notes: notes
  });
  return this.save();
};

// Instance method to add message
applicationSchema.methods.addMessage = function(senderId, message, attachments = []) {
  this.messages.push({
    sender: senderId,
    message: message,
    attachments: attachments
  });
  return this.save();
};

// Instance method to mark messages as read
applicationSchema.methods.markMessagesAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString() && !message.isRead) {
      message.isRead = true;
    }
  });
  return this.save();
};

// Instance method to withdraw application
applicationSchema.methods.withdraw = function(reason = '') {
  this.isWithdrawn = true;
  this.withdrawnAt = new Date();
  this.withdrawnReason = reason;
  this.status = 'withdrawn';
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema); 