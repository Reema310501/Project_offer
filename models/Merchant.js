import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactInfo: {
    email: { type: String, required: true },
    phone: String,
  },
  storeLocation: {
    address: String,
    city: String,
    state: String,
    zip: String,
  },
}, { timestamps: true });

export default mongoose.model('Merchant', merchantSchema);
