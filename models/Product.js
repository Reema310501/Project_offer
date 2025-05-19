import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  Price: { type: Number, required: true },
  image: { type: String },  // New field to store image filename or URL
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
