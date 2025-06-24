const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Basic Job Information
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a job description'],
    maxlength: [2000, 'Job description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },

  // Employer Information
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Please provide a company name']
  },
  companyLogo: String,

  // Job Details
  category: {
    type: String,
    required: [true, 'Please provide a job category'],
    enum: [
      'construction',
      'plumbing',
      'electrical',
      'carpentry',
      'painting',
      'cleaning',
      'gardening',
      'delivery',
      'driving',
      'cooking',
      'sewing',
      'welding',
      'masonry',
      'roofing',
      'hvac',
      'general-labor',
      'other'
    ]
  },
  subcategory: String,
  jobType: {
    type: String,
    required: [true, 'Please specify the job type'],
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'freelance']
  },
  experienceLevel: {
    type: String,
    required: [true, 'Please specify the experience level'],
    enum: ['entry-level', 'intermediate', 'experienced', 'senior', 'expert']
  },

  // Compensation
  salary: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'monthly', 'project-based'],
      required: true
    },
    min: {
      type: Number,
      required: [true, 'Please provide minimum salary']
    },
    max: {
      type: Number,
      required: [true, 'Please provide maximum salary']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },

  // Location Information
  location: {
    address: {
      type: String,
      required: [true, 'Please provide job location']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    pincode: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    isRemote: {
      type: Boolean,
      default: false
    },
    travelRequired: {
      type: Boolean,
      default: false
    },
    travelAllowance: Number
  },

  // Requirements and Skills
  requiredSkills: [{
    name: String,
    level: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced']
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  preferredSkills: [String],
  requirements: {
    education: {
      type: String,
      enum: ['none', 'high-school', 'diploma', 'bachelor', 'master', 'phd']
    },
    certifications: [String],
    languages: [String],
    ageRange: {
      min: Number,
      max: Number
    },
    gender: {
      type: String,
      enum: ['any', 'male', 'female']
    },
    physicalRequirements: [String],
    tools: [String]
  },

  // Job Schedule and Duration
  schedule: {
    workDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    workHours: {
      start: String, // Format: "09:00"
      end: String,   // Format: "17:00"
      totalHours: Number
    },
    shiftType: {
      type: String,
      enum: ['day', 'night', 'rotating', 'flexible']
    }
  },
  duration: {
    type: String,
    enum: ['one-time', 'ongoing', 'project-based', 'seasonal'],
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: Date,
  isUrgent: {
    type: Boolean,
    default: false
  },

  // Benefits and Perks
  benefits: [{
    type: String,
    enum: [
      'health-insurance',
      'paid-leave',
      'overtime-pay',
      'bonus',
      'transportation',
      'meals',
      'accommodation',
      'training',
      'equipment',
      'uniform',
      'other'
    ]
  }],
  perks: [String],

  // Application and Hiring
  maxApplicants: {
    type: Number,
    default: 50
  },
  currentApplicants: {
    type: Number,
    default: 0
  },
  positionsAvailable: {
    type: Number,
    default: 1
  },
  positionsFilled: {
    type: Number,
    default: 0
  },
  applicationDeadline: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired', 'cancelled'],
    default: 'draft'
  },

  // Visibility and Promotion
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  promotionExpires: Date,
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },

  // Analytics and Performance
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },

  // Additional Information
  tags: [String],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  notes: String,

  // Timestamps
  postedDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ 'location.city': 1, status: 1 });
jobSchema.index({ salary: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ isActive: 1, status: 1 });
jobSchema.index({ isFeatured: 1, isActive: 1 });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ expiresAt: 1 });
jobSchema.index({ title: 'text', description: 'text', companyName: 'text' });

// Virtual for isExpired
jobSchema.virtual('isExpired').get(function() {
  if (this.expiresAt) {
    return new Date() > this.expiresAt;
  }
  return false;
});

// Virtual for isFull
jobSchema.virtual('isFull').get(function() {
  return this.currentApplicants >= this.maxApplicants;
});

// Virtual for isHiring
jobSchema.virtual('isHiring').get(function() {
  return this.positionsFilled < this.positionsAvailable;
});

// Virtual for salary range
jobSchema.virtual('salaryRange').get(function() {
  if (this.salary.min === this.salary.max) {
    return `${this.salary.currency} ${this.salary.min}`;
  }
  return `${this.salary.currency} ${this.salary.min} - ${this.salary.max}`;
});

// Pre-save middleware to update lastUpdated
jobSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Pre-save middleware to set expiresAt if not provided
jobSchema.pre('save', function(next) {
  if (!this.expiresAt && this.status === 'active') {
    // Set expiry to 30 days from posting
    this.expiresAt = new Date(this.postedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Static method to find active jobs
jobSchema.statics.findActiveJobs = function() {
  return this.find({
    status: 'active',
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  });
};

// Static method to find jobs by location
jobSchema.statics.findByLocation = function(city, state) {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    'location.state': new RegExp(state, 'i'),
    status: 'active',
    isActive: true
  });
};

// Static method to find jobs by category
jobSchema.statics.findByCategory = function(category) {
  return this.find({
    category: category,
    status: 'active',
    isActive: true
  });
};

// Instance method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment applications
jobSchema.methods.incrementApplications = function() {
  this.applications += 1;
  this.currentApplicants += 1;
  return this.save();
};

// Instance method to decrement applications
jobSchema.methods.decrementApplications = function() {
  this.currentApplicants = Math.max(0, this.currentApplicants - 1);
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema); 