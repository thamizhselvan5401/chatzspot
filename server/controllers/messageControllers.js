const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log('Invalid data passed into request');
    return res.status(400);
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId
  }

  try {
    let message = await Message.create(newMessage)

    message = await message.populate('sender', 'userName avatar')
    message = await message.populate('chat')
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'userName avatar email'
    })

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message
    })

    const chat = await Chat.findById(chatId)

    await Promise.all(
      chat.users.map(async (user) => {
        if (user._id.toString() === req.user._id.toString()) return;

        chat.unreadMessages.set(
          user._id.toString(),
          (chat.unreadMessages.get(user._id.toString()) || 0) + 1
        );
      })
    );

    await chat.save(); // Ensure changes are saved

    res.json(message);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
})

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.id })
      .populate('sender', 'userName avatar email')
      .populate('chat')

    res.json(messages)
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
})

module.exports = { sendMessage, allMessages }