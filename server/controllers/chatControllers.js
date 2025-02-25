const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

const accessChat = asyncHandler(async (req, res) => {
  const userId = req.params.id

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  }).populate('users', '-password').populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "userName avatar email"
  })

  if (isChat.length > 0) {
    res.send(isChat[0])
  } else {
    res.status(404);
    throw new Error('Chat not found');
  }
})

const createChat = asyncHandler(async (req, res) => {
  const userId = req.params.id

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  }).populate('users', '-password').populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "userName avatar email"
  })

  if (isChat.length > 0) {
    res.send(isChat[0])
  } else {
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId]
    }

    try {
      const createChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createChat._id }).populate(
        'users',
        '-password'
      );

      res.status(200).send(FullChat);
    } catch (err) {
      res.status(400);
      throw new Error(err.message);
    }
  }
})

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await User.populate(result, {
          path: 'latestMessage.sender',
          select: 'userName avatar email'
        })

        res.status(200).send(result);
      })
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
})

const createGroupChat = asyncHandler(async (req, res) => {
  const { users, name, avatar } = req.body || {}
  
  if (!users || !name) {
    return res.status(400).send({ message: 'Please fill all the fields' })
  }
  const parsedUsers = JSON.parse(users)

  if (parsedUsers.length < 2) {
    return res.status(400)
    .send('More than 2 users are required to create a group chat');
  }

  parsedUsers.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users: parsedUsers,
      isGroupChat: true,
      groupAdmin: req.user,
      avatar
    })

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    
    res.status(200).json(fullGroupChat);
  } catch (err) {
    res.status(400);
    throw new Error(err.message)
  }
})

const updateGroupChat = asyncHandler(async (req, res) => {
  const { updatedChat } = req.body;
  const {chatName, users, avatar} = updatedChat

  if (!updatedChat) {
    res.status(400);
    throw new Error("Group Data is required");
  }

  if (users.length < 2) {
    return res.status(400)
      .send('More than 2 users are required to create a group chat');
  }

  const updatedGroup = await Chat.findByIdAndUpdate(updatedChat._id, {
    chatName,
    users,
    avatar
  }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }

  res.json(updatedGroup);
})

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedGroup = await Chat.findByIdAndUpdate(chatId, {
    chatName
  }, { new: true }).populate('users', '-password')
    .populate('groupAdmin', '-password')

  if (!updatedGroup) {
    res.status(404);
    throw new Error('Group not found');
  } else {
    res.json(updatedGroup)
  }
})

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(chatId, {
      $push: { users: userId }
    }, { new: true}
  ).populate('users', '-password')
  .populate('groupAdmin', '-password');

  if (!added) {
    res.status(404);
    throw new Error('Chat Not Fount')
  } else {
    res.json(added)
  }
})

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(chatId, {
      $pull: { users: userId }
    }, { new: true}
  ).populate('users', '-password')
  .populate('groupAdmin', '-password');

  if (!removed) {
    res.status(404);
    throw new Error('Chat Not Fount')
  } else {
    res.json(removed)
  }
})

module.exports = { createChat, accessChat, fetchChats, createGroupChat, renameGroupChat, addToGroup, removeFromGroup, updateGroupChat }