const mongoose = require('mongoose');

const chatModel = mongoose.Schema(
  {
    chatName: { type: 'string', trim: true },
    isGroupChat: { type: 'boolean', default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    avatar: { type: 'string' },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    unreadMessages: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true
  }
)

const Chat = mongoose.model('Chat', chatModel);

module.exports = Chat;