const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const OTP_EXPIRY_MINUTES = 10;

const buildAuthResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  verified: user.verified,
  token: generateToken(user._id),
});

const sendVerificationOTP = async (user) => {
  const otp = generateOTP();

  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  user.otpHash = otpHash;
  user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await user.save();

  const message = `
Welcome to Anvexa!

Your email verification code is:

${otp}

This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.

Do not share this OTP with anyone.
`;

  await sendEmail(user.email, 'Anvexa Email Verification', message);
};

// Register User
const registerUser = async (req, res) => {
  const { username, name, email, password } = req.body;
  const displayName = username || name;

  if (!displayName || !email || !password) {
    return res.status(400).json({
      message: 'Please provide name, email, and password',
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.verified) {
        return res.status(400).json({
          success: false,
          message: 'User already exists. Please login.',
        });
      }

      try {
        await sendVerificationOTP(existingUser);
        return res.status(200).json({
          success: true,
          message: 'Your account already exists but is not verified. A new OTP has been sent to your email.',
          email: existingUser.email,
        });
      } catch (error) {
        existingUser.verified = true;
        await existingUser.save();
        return res.status(200).json({
          success: true,
          message: 'Your account is active now. Email verification is currently unavailable, so your account has been activated automatically.',
          ...buildAuthResponse(existingUser),
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: name || username,
      email,
      password: hashedPassword,
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    const emailConfigured = Boolean(process.env.GMAIL_USER && process.env.GMAIL_PASS);

    if (!emailConfigured) {
      user.verified = true;
      await user.save();
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Email verification is unavailable right now, so your account was activated immediately.',
        ...buildAuthResponse(user),
      });
    }

    try {
      await sendVerificationOTP(user);
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email using the OTP sent to your email address.',
        email: user.email,
      });
    } catch (error) {
      user.verified = true;
      await user.save();
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Email delivery is currently unavailable, so your account was activated automatically.',
        ...buildAuthResponse(user),
      });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error('Register user failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Login User
const  loginUser = async (req , res)=>{
  const { email , password } = req.body;
  try{
    const user = await User.findOne({ email });
    if(user && (await bcrypt.compare(password , user.password))){
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Users
const getUsers = async (req , res)=>{
  try{
    const users = await User.find({}).select('-password');// Exclude password field from the response
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//OTP Verification
// Verify Email OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required.",
    });
  }

  try {
    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Already verified
    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    // OTP missing
    if (!user.otpHash || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new OTP.",
      });
    }

    // OTP expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp, user.otpHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Verify user
    user.verified = true;
    user.otpHash = null;
    user.otpExpiry = null;

    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { registerUser , loginUser , getUsers , verifyOTP };