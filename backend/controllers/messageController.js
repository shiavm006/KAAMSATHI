const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  // Get all messages for the user
  const messages = await Message.find({
    $or: [
      { sender: req.user.id },
      { receiver: req.user.id }
    ],
    isDeleted: false
  })
  .populate('sender', 'name avatar userType')
  .populate('receiver', 'name avatar userType')
  .sort({ createdAt: -1 });

  // Group messages by conversation
  const conversations = {};
  messages.forEach(message => {
    const otherUser = message.sender._id.toString() === req.user.id 
      ? message.receiver 
      : message.sender;
    
    const conversationId = otherUser._id.toString();
    
    if (!conversations[conversationId]) {
      conversations[conversationId] = {
        user: otherUser,
        lastMessage: message,
        unreadCount: 0
      };
    }
    
    if (message.receiver._id.toString() === req.user.id && !message.isRead) {
      conversations[conversationId].unreadCount++;
    }
  });

  const conversationList = Object.values(conversations);
  const total = conversationList.length;
  const paginatedConversations = conversationList.slice(startIndex, startIndex + limit);

  res.status(200).json({
    success: true,
    count: paginatedConversations.length,
    total,
    data: paginatedConversations
  });
});

// @desc    Get messages between two users
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;

  // Check if other user exists
  const otherUser = await User.findById(req.params.userId);
  if (!otherUser) {
    return next(new ErrorResponse('User not found', 404));
  }

  const messages = await Message.getConversation(
    req.user.id,
    req.params.userId,
    limit,
    startIndex
  );

  // Mark messages as read
  await Message.markAsRead(req.params.userId, req.user.id);

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages.reverse() // Show oldest first
  });
});

// @desc    Send a message
// @route   POST /api/messages/:userId
// @access  Private
const sendMessage = asyncHandler(async (req, res, next) => {
  const { message, messageType = 'text', attachments = [] } = req.body;

  if (!message && attachments.length === 0) {
    return next(new ErrorResponse('Message content is required', 400));
  }

  // Check if other user exists
  const receiver = await User.findById(req.params.userId);
  if (!receiver) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check if user is trying to message themselves
  if (req.params.userId === req.user.id) {
    return next(new ErrorResponse('Cannot send message to yourself', 400));
  }

  const newMessage = await Message.create({
    sender: req.user.id,
    receiver: req.params.userId,
    message: message || '',
    messageType,
    attachments
  });

  await newMessage.populate('sender', 'name avatar userType');
  await newMessage.populate('receiver', 'name avatar userType');

  res.status(201).json({
    success: true,
    data: newMessage
  });
});

// @desc    Mark messages as read
// @route   PUT /api/messages/:userId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res, next) => {
  await Message.markAsRead(req.params.userId, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Messages marked as read'
  });
});

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new ErrorResponse('Message not found', 404));
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this message', 401));
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.deletedBy = req.user.id;
  await message.save();

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Message.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: { unreadCount: count }
  });
});

// @desc    Search messages
// @route   GET /api/messages/search
// @access  Private
const searchMessages = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  if (!q) {
    return next(new ErrorResponse('Search query is required', 400));
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user.id },
      { receiver: req.user.id }
    ],
    message: { $regex: q, $options: 'i' },
    isDeleted: false
  })
  .populate('sender', 'name avatar userType')
  .populate('receiver', 'name avatar userType')
  .sort({ createdAt: -1 })
  .skip(startIndex)
  .limit(limit);

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages
}; 