import Merchant from '../models/Merchant.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// Add Merchant
export const addMerchant = asyncHandler(async (req, res) => {
const { name, contactInfo, storeLocation } = req.body;

if (!name || !contactInfo || !contactInfo.email) {
throw new ApiError(400, 'Name and contact email are required');
}

const merchant = new Merchant({ name, contactInfo, storeLocation });
await merchant.save();

res.status(201).json({ message: 'Merchant added', merchant });
});

// Get All Merchants
export const getMerchants = asyncHandler(async (req, res) => {
const merchants = await Merchant.find();
res.json(merchants);
});