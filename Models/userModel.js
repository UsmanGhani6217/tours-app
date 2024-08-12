const crypto = require('crypto');
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    index: true,
    required: [true, "please provide your name."],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "please provide your email."],
    lowercase: true,
    validate: [validator.isEmail, "please provide a valid email."],
  },
  photo: String,
  role:{
    type:String,
    enum:['user', 'guide', 'lead-guide', 'admin'],
    default:'user'
  },
  password: {
    type: String,
    required: [true, "please provide your password."],
    minlength: 8,
    select:false
  },
  passwordConfirm: {
    type: String,
    required: [true, "please provide your confirm password."],
    validate: {
      // This only work on SAVE !...
      validator: function (e1) {
        return e1 === this.password;
      },
      message: "Passwords are not same",
    },
  },
  passwordChangedAt:Date,
  passwordResetToken: String,
  passwordResetExpiry:Date,
  active:{
    type:Boolean,
    default:true,
    select:false
  }
});

userSchema.pre("save", async function (next) {
  // only run this function if password was not modified
  if (!this.isModified("password")) return next();
  // hash the password cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete the confirm field
  this.passwordConfirm = undefined
  next()
});
userSchema.pre("save", function (next) {
  // only run this function if password was modified
  if (!this.isModified("password") || this.isNew) return next();
  // update current Date and time when password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next()
});

userSchema.pre(/^find/, function (next) {
  this.find({active :{$ne:false}})
  next()
});
userSchema.methods.correctPassword = async function(password, hashPassword) {
  return await bcrypt.compare(password, hashPassword); 
}

userSchema.methods.changePasswordAfter = function(JWTTimeStamp) {
  if(this.passwordChangedAt){
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
}
userSchema.methods.createPasswordResetToken = function() {
const resetToken = crypto.randomBytes(32).toString('hex');
this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
this.passwordResetExpiry = Date.now() + 10*60*1000;
return resetToken;
}
const User = mongoose.model("User", userSchema);
module.exports = User;
