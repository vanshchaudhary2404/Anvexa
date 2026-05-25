const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id)=>{
  // TODO: Implement JWT token generation
  // Example using jsonwebtoken library:
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


// Register User
const registerUser = async (req , res)=>{
  const { username , email , password } = req.body;
  try{
    const userExists = await User.findOne({ email });
    if(userExists){
      return res.status(400).json({ message: "User already exists" });
    }
    //TODO: Hash the password before saving to the database
    //TODO: Implement JWT token generation for authentication
    //TODO: OTP verification for email confirmation
    //TODO: WELCOME EMAIL TO USER AFTER REGISTRATION
    
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password , salt);

      const user = await User.create({
        username,
        email,
        password: hashedPassword
      });

      if(user){
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP  
        
        const message = `
          Welcome to Anvexa , ${user.username}! Thank you for registering with us. We are excited to have you on board.
          Your OTP for email verification is: ${otp}`;
         
          await sendEmail({
            to: user.email,
            subject: "Welcome to Anvexa - Email Verification",
            text: message
          });

          res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
          });
        } else{
          res.status(400).json({message: 'Invalid user data' });
        }

  }catch(error){
    res.status(500).json({ message: "Server error" });
  }
}


// Login User
const loginUser = async (req , res)=>{
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
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser , loginUser , getUsers };