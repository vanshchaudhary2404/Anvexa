const mongoose = require('mongoose');

const dns = require('dns');

dns.setServers([ '1.1.1.1' , '8.8.8.8']);

const connectDB = async ()=>{
  try{
    // await mongoose.connect(process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('mongoDB connected successfully'); 
  }catch(error){
    console.error('MongoDB connection failed:' , error.message);
    process.exit(1);
  }
}

module.exports = connectDB;