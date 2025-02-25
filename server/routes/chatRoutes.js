const express = require('express');
const protect = require('../middleware/authMiddleware');
const { accessChat, fetchChats, createGroupChat, renameGroupChat, addToGroup, removeFromGroup, updateGroupChat, createChat } = require('../controllers/chatControllers');

const router = express.Router();

router.route('/create/:id').post(protect, createChat);
router.route('/access/:id').post(protect, accessChat);
router.route('/').post(protect, fetchChats);
router.route('/createGroup').post(protect, createGroupChat);
router.route('/updateGroup').post(protect, updateGroupChat);
// router.route('/rename').put(protect, renameGroupChat);
// router.route('groupadd').put(protect, addToGroup);
// router.route('groupremove').put(protect, removeFromGroup);

module.exports = router;