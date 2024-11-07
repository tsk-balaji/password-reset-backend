const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: Number,
  email: { type: String, required: true, unique: true },
  password: String,
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
