import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  appliesToAllProducts: { type: Boolean, default: false },
  specificProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MerchantProduct' }],
  discountPercentage: { type: Number, required: true, min: 0, max: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  offerImage: String, // will store file path or URL
  title: { type: String, required: true },
  description: String,
  originalPrices: [{
    merchantProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'MerchantProduct' },
    originalPrice: Number
  }],
  active: { type: Boolean, default: true },         // Optional for UI control
  isExpired: { type: Boolean, default: false }      // Used for rollback logic
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
