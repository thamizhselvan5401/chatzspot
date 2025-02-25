const asyncHandler = require('express-async-handler');
const user = require('../models/userModel');
const generateToken = require('../config/generateToken')
const jwt = require('jsonwebtoken');

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, avatar } = req.body;

  if (!userName || !email || !password) {
    res.status(400)
    throw new Error("Please enter all fields")
  }

  const userExists = await user.findOne({ email })

  if (userExists) {
    res.status(400);
    throw new Error("Email already exists")
  }

  const newUser = await user.create({
    userName,
    email,
    password,
    avatar
  })

  if (newUser) {
    res.status(201).json({ success: true, data: { newUser, token: generateToken(newUser._id) } });
  } else {
    res.status(400)
    throw new Error("Failed to register user")
  }
})

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const userAcc = await user.findOne({ email });

  if (userAcc && (await userAcc.matchPassword(password))) {
    res.json({
      success: true,
      data: { token: generateToken(userAcc._id) }
    })
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }

})

const allUsers = asyncHandler(async (req, res) => {
  const keyWord = req.query.search
  console.log(req)

  const query = keyWord ? {
    $or: [
      { userName: { $regex: keyWord, $options: 'i' } },
      { email: { $regex: keyWord, $options: 'i' } }
    ]
  } : {}

  const users = await user.find(query).find({ _id: { $ne: req.user._id } }).select('-password');
  res.send(users);
})

const getUserProfile = asyncHandler(async (req, res) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const userProfile = await user.findById(decoded.id).select('-password')
      res.send(userProfile)
    } catch (err) {
      res.status(401)
      throw new Error(err, 'token failed')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token provided')
  }
})

const updateUserProfile = asyncHandler(async (req, res) => {
  const profile = req.body;
  const { _id, userName, avatar, email } = profile

  const updatedProfile = await user.findByIdAndUpdate(_id, {
    userName, avatar, email
  }, { new: true }).select('-password')

  if (!updatedProfile) {
    res.status(401)
    throw new Error('Profile not Found')
  }

  res.json(updatedProfile)
})

module.exports = { registerUser, authUser, allUsers, getUserProfile, updateUserProfile }