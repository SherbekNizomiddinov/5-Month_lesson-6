import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB ulandi');
  } catch (error) {
    console.error('MongoDB ulanish xatosi:', error.message);
    process.exit(1);
  }
};

export default connectDB;