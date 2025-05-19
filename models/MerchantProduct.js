import mongoose from 'mongoose';

const merchantProductSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  merchantPrice: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
}, { timestamps: true });

const MerchantProduct = mongoose.model('MerchantProduct', merchantProductSchema);
export default MerchantProduct;
