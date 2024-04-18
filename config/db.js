require("dotenv").config();
const mongoose = require("mongoose");

const connectMonggose = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true, 
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1); // Exit with error code in production
  }
};

exports.connectMonggose = connectMonggose; // Export to maintain consistency
