const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  updateWorkerProfile,
  updateEmployerProfile,
  uploadDocuments,
  getUserStats
} = require('../controllers/userController');

const { protect, authorize, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.route('/')
  .get(authorizeRoles('admin'), getUsers)
  .post(authorizeRoles('admin'), createUser);

router.route('/stats')
  .get(authorizeRoles('admin'), getUserStats);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorizeRoles('admin'), deleteUser);

// Profile routes
router.put('/profile', updateProfile);
router.put('/worker-profile', authorize('worker'), updateWorkerProfile);
router.put('/employer-profile', authorize('employer'), updateEmployerProfile);
router.put('/documents', uploadDocuments);

module.exports = router; 