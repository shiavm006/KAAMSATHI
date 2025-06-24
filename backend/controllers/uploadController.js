const asyncHandler = require('express-async-handler');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const ErrorResponse = require('../utils/errorResponse');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  }
  // Allow PDFs
  else if (file.mimetype === 'application/pdf') {
    cb(null, true);
  }
  // Allow documents
  else if (file.mimetype.includes('document') || 
           file.mimetype.includes('msword') || 
           file.mimetype.includes('vnd.openxmlformats')) {
    cb(null, true);
  }
  else {
    cb(new ErrorResponse('Invalid file type. Only images, PDFs, and documents are allowed.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files at once
  }
});

// @desc    Upload profile image
// @route   POST /api/uploads/profile-image
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'kaamsathi/profile-images',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          return next(new ErrorResponse('Error uploading file', 500));
        }
        
        res.status(200).json({
          success: true,
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            filename: req.file.originalname
          }
        });
      }
    ).end(req.file.buffer);

  } catch (error) {
    return next(new ErrorResponse('Error uploading file', 500));
  }
});

// @desc    Upload job attachment
// @route   POST /api/uploads/job-attachment
// @access  Private
const uploadJobAttachment = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'kaamsathi/job-attachments',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          return next(new ErrorResponse('Error uploading file', 500));
        }
        
        res.status(200).json({
          success: true,
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            filename: req.file.originalname,
            size: req.file.size,
            type: req.file.mimetype
          }
        });
      }
    ).end(req.file.buffer);

  } catch (error) {
    return next(new ErrorResponse('Error uploading file', 500));
  }
});

// @desc    Upload document
// @route   POST /api/uploads/document
// @access  Private
const uploadDocument = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const { documentType } = req.body;
  if (!documentType) {
    return next(new ErrorResponse('Document type is required', 400));
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: `kaamsathi/documents/${documentType}`,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          return next(new ErrorResponse('Error uploading file', 500));
        }
        
        res.status(200).json({
          success: true,
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            filename: req.file.originalname,
            size: req.file.size,
            type: req.file.mimetype,
            documentType
          }
        });
      }
    ).end(req.file.buffer);

  } catch (error) {
    return next(new ErrorResponse('Error uploading file', 500));
  }
});

// @desc    Upload multiple files
// @route   POST /api/uploads/multiple
// @access  Private
const uploadMultipleFiles = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one file', 400));
  }

  const uploadPromises = req.files.map(file => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'kaamsathi/multiple',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              filename: file.originalname,
              size: file.size,
              type: file.mimetype
            });
          }
        }
      ).end(file.buffer);
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    return next(new ErrorResponse('Error uploading files', 500));
  }
});

// @desc    Delete file from Cloudinary
// @route   DELETE /api/uploads/:publicId
// @access  Private
const deleteFile = asyncHandler(async (req, res, next) => {
  const { publicId } = req.params;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      return next(new ErrorResponse('Error deleting file', 500));
    }
  } catch (error) {
    return next(new ErrorResponse('Error deleting file', 500));
  }
});

// @desc    Get upload statistics
// @route   GET /api/uploads/stats
// @access  Private/Admin
const getUploadStats = asyncHandler(async (req, res, next) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'kaamsathi/',
      max_results: 1000
    });

    const stats = {
      totalFiles: result.resources.length,
      totalSize: result.resources.reduce((acc, file) => acc + file.bytes, 0),
      folders: {
        'profile-images': result.resources.filter(f => f.folder === 'kaamsathi/profile-images').length,
        'job-attachments': result.resources.filter(f => f.folder === 'kaamsathi/job-attachments').length,
        'documents': result.resources.filter(f => f.folder.includes('kaamsathi/documents')).length
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    return next(new ErrorResponse('Error fetching upload stats', 500));
  }
});

module.exports = {
  upload,
  uploadProfileImage,
  uploadJobAttachment,
  uploadDocument,
  uploadMultipleFiles,
  deleteFile,
  getUploadStats
}; 