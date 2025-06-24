const express = require('express');
const { 
  upload,
  uploadProfileImage, 
  uploadJobAttachment, 
  uploadDocument, 
  uploadMultipleFiles, 
  deleteFile, 
  getUploadStats 
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/uploads/profile-image
// @desc    Upload profile image
// @access  Private
router.post('/profile-image', upload.single('image'), uploadProfileImage);

// @route   POST /api/uploads/job-attachment
// @desc    Upload job attachment
// @access  Private
router.post('/job-attachment', upload.single('file'), uploadJobAttachment);

// @route   POST /api/uploads/document
// @desc    Upload document
// @access  Private
router.post('/document', upload.single('document'), uploadDocument);

// @route   POST /api/uploads/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple', upload.array('files', 5), uploadMultipleFiles);

// @route   DELETE /api/uploads/:publicId
// @desc    Delete a file
// @access  Private
router.delete('/:publicId', deleteFile);

// @route   GET /api/uploads/stats
// @desc    Get upload statistics
// @access  Private/Admin
router.get('/stats', getUploadStats);

module.exports = router; 