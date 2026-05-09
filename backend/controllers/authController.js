const User = require('../model/User');

// Register User
const registerUser = async (req , res)=>{
  const { username , email , password } = req.body;
  try{
    const userExists = await User.findOne({ email });
    if(userExists){
      return res.status(400).json({ message: "User already exists" });
    } else{
      const user = await User.create({
        username,
        email,
        password
      });
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }); 
    }
  }catch(error){
    res.status(500).json({ message: "Server error" });
  }
}