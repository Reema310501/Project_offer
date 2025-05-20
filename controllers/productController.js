import Product from '../models/Product.js';
import MerchantProduct from '../models/MerchantProduct.js';
import {ApiError} from '../utils/ApiError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// Add product to main collection with image upload
export const addProduct = asyncHandler(async (req, res) => {
  const { name, description, category, Price } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'Product image is required');
  }

  const product = new Product({
    name,
    description,
    category,
    Price,
    image: req.file.filename, // save uploaded file name here
  });

  await product.save();
  res.status(201).json({ success: true, product });
});

// Add product to a merchant's collection with merchant-specific price and quantity
export const addProductToMerchant = asyncHandler(async (req, res) => {
  const { merchantId } = req.params;
  const { name, description, category, Price } = req.body;

  if (!merchantId) {
    throw new ApiError(400, "Merchant ID is required.");
  }

  if (!name || !Price) {
    throw new ApiError(400, "Product name and price are required.");
  }

  if (!req.file?.filename) {
    throw new ApiError(400, "Product image is required.");
  }

  // Save new product
  const newProduct = new Product({
    name,
    description,
    category,
    Price,
    image: req.file.filename,
  });

  await newProduct.save();

  // Map the product to merchant
  const alreadyMapped = await MerchantProduct.findOne({
    merchant: merchantId,
    product: newProduct._id,
  });

  if (alreadyMapped) {
    return res.status(200).json({
      success: true,
      message: "Product added, but already mapped to merchant.",
      product: newProduct,
    });
  }

  const mappedProduct = new MerchantProduct({
    merchant: merchantId,
    product: newProduct._id,
    merchantPrice: Price,
    quantity: 0,
  });

  await mappedProduct.save();

  res.status(201).json({
    success: true,
    message: "Product added and mapped to merchant.",
    product: newProduct,
    mappedProduct,
  });
});

// Map multiple main products to merchant products (with default merchantPrice = basePrice, quantity=0)
export const mapProductsToMerchant = asyncHandler(async (req, res) => {
  const { merchantId } = req.params;
  const { productIds } = req.body; // expect array of product IDs

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError(400, "productIds must be a non-empty array.");
  }

  const mappedProducts = [];

  for (const prodId of productIds) {
    const product = await Product.findById(prodId);
    if (!product) continue;

    // Check if already mapped
    const exists = await MerchantProduct.findOne({ merchant: merchantId, product: prodId });
    if (exists) continue;

    const merchantProduct = new MerchantProduct({
      merchant: merchantId,
      product: prodId,
      merchantPrice: product.Price,
      quantity: 0
    });

    await merchantProduct.save();
    mappedProducts.push(merchantProduct);
  }

  res.json({ success: true, mappedProducts });
});
