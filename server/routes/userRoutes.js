const express = require('express');
const { registerUser, authUser, allUsers, getUserProfile, updateUserProfile } = require('../controllers/userControllers')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.route('/').post(registerUser).get(protect, allUsers)
router.post('/login', authUser)
router.get('/getuser', getUserProfile)
router.route('/updateProfile', ).post(protect, updateUserProfile)

module.exports = router;