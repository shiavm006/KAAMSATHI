const express = require('express');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages
} = require('../controllers/messageController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation schemas
const sendMessageSchema = {
  body: Joi.object({
    message: Joi.string().max(1000),
    messageType: Joi.string().valid('text', 'image', 'file', 'location').default('text'),
    attachments: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        url: Joi.string().uri().required(),
        type: Joi.string().required(),
        size: Joi.number()
      })
    ).default([])
  }).or('message', 'attachments')
};

const searchSchema = {
  query: Joi.object({
    q: Joi.string().required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

// Message routes
router.route('/conversations')
  .get(getConversations);

router.route('/unread/count')
  .get(getUnreadCount);

router.route('/search')
  .get(validate(searchSchema), searchMessages);

router.route('/:userId')
  .get(getMessages)
  .post(validate(sendMessageSchema), sendMessage);

router.route('/:userId/read')
  .put(markAsRead);

router.route('/message/:messageId')
  .delete(deleteMessage);

module.exports = router; 