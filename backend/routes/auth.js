const express = require('express');
const {
  register,
  login,
  sendOTPForVerification,
  verifyOTP,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
  getMe
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTPForVerification);
router.post('/verify-otp', verifyOTP);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
router.post('/logout', protect, logout);

module.exports = router; 