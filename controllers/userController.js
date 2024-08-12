const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const createAppError = require("../utils/helper/appError");
const sendAppResponse = require("../utils/helper/appResponse");
const User = require("../Models/userModel");
const filterObj = (obj = {}, allowedFields = []) => {
  const newObj = {};
  allowedFields.map((key) => {
    if (obj.hasOwnProperty(key)) newObj[key] = obj[key];
  });
  return newObj;
};
exports.updateMe = async (req, res, next) => {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      throw createAppError("This route is not password updates", 400);
    }
    // filtered out the unwanted fields that are not allowed to be updated
    const filterBody = filterObj(req.body, ["name", "email"]);
    // update the current user data
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
      new: true,
      runValidator: true,
    });
    sendAppResponse({
        res,
        statusCode: 200,
        status: "success",
        data: updatedUser,
    })
    
  } catch (error) {
    next(error);
  }
};
exports.deleteMe = async (req, res, next) => {
    try {
       await User.findByIdAndUpdate(req.user.id, {active:false});
      sendAppResponse({
        res,
        statusCode: 200,
        status: "success",
        message: "Your account has been deleted successfully.",
    })
    } catch (error) {
      next(error);
    }
  };
  exports.getAllUsers = async (req, res, next) => {
    try {
       const users = await User.find({});
       sendAppResponse({
         res,
         statusCode: 200,
         status: "success",
         data:users
     })
     } catch (error) {
       next(error);
     }
  }