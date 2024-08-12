const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const { updateMe, deleteMe, getAllUsers } = userController;
const { signUp, logIn,  forgetPassword, resetPassword, updatePassword, authentication } = authController;

const router = express.Router();
router.route("/").get(getAllUsers)
router.route('/signUp').post(signUp);
router.route('/login').post(logIn);
router.route('/forgetPassword').post(forgetPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updatePassword').patch(authentication, updatePassword);
router.route('/updateMe').patch(authentication, updateMe);
router.route('/deleteMe').delete(authentication, deleteMe);

module.exports = router;
