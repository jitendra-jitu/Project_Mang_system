const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const connectDB = async () => {
  try {
    console.log(process.env.MONGODB_URI); // Debugging: Check if the URI is being read
    
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in the environment variables");
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {}); // Remove deprecated options
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
