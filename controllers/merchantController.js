import Merchant from '../models/Merchant.js';

// Add Merchant
export const addMerchant = async (req, res) => {
  try {
    const { name, contactInfo, storeLocation } = req.body;
    if (!name || !contactInfo || !contactInfo.email) {
      return res.status(400).json({ message: 'Name and contact email are required' });
    }

    const merchant = new Merchant({ name, contactInfo, storeLocation });
    await merchant.save();

    res.status(201).json({ message: 'Merchant added', merchant });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Merchants
export const getMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find();
    res.json(merchants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
