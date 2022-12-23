const express = require('express');
const router = express.Router();

const {
    userRegister,
    login,
    logout,
    getUser,
    getLoginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.post('/register', userRegister);
router.post('/login', login);
router.get('/logout', logout);
router.get('/getuser', protect, getUser);
router.get('/getstatus', getLoginStatus);
router.patch('/updateuser', protect, updateUser);
router.patch('/changepassword', protect, changePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;
