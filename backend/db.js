import mongoose from "mongoose";

const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(" MongoDB Connected");
  } catch (err) {
    console.log(" Mongo Retry in 5 sec...", err.message);
    setTimeout(connectWithRetry, 5000); 
  }
};

export const connectDB = async () => {
  connectWithRetry();
};