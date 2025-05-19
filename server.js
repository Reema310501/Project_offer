import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database Connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server started on port: ${PORT}`);
});
