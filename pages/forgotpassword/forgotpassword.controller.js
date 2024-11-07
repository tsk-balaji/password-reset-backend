const App = require("express").Router();
const User = require("../forgotpassword/user.schema");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const NumSaltRounds = 10; // Define your salt rounds here
require("dotenv").config();
const { sendEmail, mailTemplate } = require("../email");

App.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "You are not registered!",
      });
    }

    // Generate a random token and hash it
    const token = crypto.randomBytes(20).toString("hex");
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");

    // Set reset token and expiry time (e.g., 1 hour from now)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Set up the email with a link to reset the password
    const mailOption = {
      email: user.email,
      subject: "Forgot Password Link",
      message: mailTemplate(
        "We have received a request to reset your password. Please reset your password using the link below.",
        `${process.env.FRONTEND_URL}/resetPassword?id=${user._id}&token=${resetToken}`,
        "Reset Password"
      ),
    };
    await sendEmail(mailOption);

    res.json({
      success: true,
      message: "A password reset link has been sent to your email.",
    });
  } catch (err) {
    console.error("Error in forgotPassword route:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

App.post("/resetPassword", async (req, res) => {
  try {
    const { password, token, userId } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Check if reset token exists
    if (!user.resetPasswordToken) {
      return res.json({
        success: false,
        message: "No reset password request found",
      });
    }

    // Check if token matches
    if (user.resetPasswordToken !== token) {
      return res.json({
        success: false,
        message: "Invalid reset password token",
      });
    }

    // Check if the token has expired
    const currDateTime = new Date();
    if (currDateTime > user.resetPasswordExpires) {
      return res.json({
        success: false,
        message: "Reset Password link has expired!",
      });
    }

    // Hash the new password and update the user record
    const salt = await bcrypt.genSalt(NumSaltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = null; // Clear the reset token
    user.resetPasswordExpires = null; // Clear the token expiration

    await user.save();

    res.json({
      success: true,
      message: "Your password reset was successful!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting the password.",
    });
  }
});

App.get("/users", async (req, res) => {
  try {
    // Get all users from database
    const users = await User.find({});

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching users from database",
    });
  }
});

// Add a new user route
App.post("/users", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(NumSaltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword
    });

    // Save user to database
    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({
      success: false, 
      message: "Error creating user"
    });
  }
});

module.exports = App;
