import mongoose from 'mongoose';
import Offer from '../models/Offer.js';
import MerchantProduct from '../models/MerchantProduct.js';

const { Types } = mongoose;

// Helper to apply discount and store original prices
const applyDiscount = async (offer) => {
  const affectedProducts = [];

  if (offer.appliesToAllProducts) {
    const products = await MerchantProduct.find({ merchant: offer.merchant });

    for (const mp of products) {
      offer.originalPrices.push({
        merchantProduct: mp._id,
        originalPrice: mp.merchantPrice,
      });

      mp.merchantPrice = mp.merchantPrice * (1 - offer.discountPercentage / 100);
      await mp.save();
      affectedProducts.push(mp._id);
    }
  } else {
    for (const mpId of offer.specificProducts) {
      const mp = await MerchantProduct.findById(mpId);
      if (!mp) continue;

      offer.originalPrices.push({
        merchantProduct: mp._id,
        originalPrice: mp.merchantPrice,
      });

      mp.merchantPrice = mp.merchantPrice * (1 - offer.discountPercentage / 100);
      await mp.save();
      affectedProducts.push(mp._id);
    }
  }

  await offer.save();

  // Restore original prices after 5 minutes
  setTimeout(async () => {
    try {
      const currentOffer = await Offer.findById(offer._id);
      if (!currentOffer || currentOffer.isExpired) return;

      for (const priceInfo of currentOffer.originalPrices) {
        const mp = await MerchantProduct.findById(priceInfo.merchantProduct);
        if (mp) {
          mp.merchantPrice = priceInfo.originalPrice;
          await mp.save();
        }
      }

      currentOffer.isExpired = true;
      await currentOffer.save();
    } catch (err) {
      console.error('Error restoring prices:', err.message);
    }
  }, 5 * 60 * 1000);
};

// Create offer
export const createOffer = async (req, res) => {
  try {
    let {
      merchant,
      appliesToAllProducts,
      specificProducts,
      discountPercentage,
      title,
      description,
      startDate,
      endDate,
    } = req.body;

    appliesToAllProducts = appliesToAllProducts === 'true' || appliesToAllProducts === true;
    discountPercentage = Number(discountPercentage);

    if (specificProducts) {
      try {
        specificProducts = JSON.parse(specificProducts);
        specificProducts = specificProducts.map(id => new Types.ObjectId(id));
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'specificProducts must be a valid JSON array string.',
        });
      }
    } else {
      specificProducts = [];
    }

    const missingFields = [];
    if (!merchant) missingFields.push('merchant');
    if (!title) missingFields.push('title');
    if (isNaN(discountPercentage)) missingFields.push('discountPercentage');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or invalid required fields: ${missingFields.join(', ')}`,
      });
    }

    if (!appliesToAllProducts && (!Array.isArray(specificProducts) || specificProducts.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'specificProducts array is required when appliesToAllProducts is false.',
      });
    }

    const now = new Date();
    startDate = startDate ? new Date(startDate) : now;
    endDate = endDate ? new Date(endDate) : new Date(now.getTime() + 5 * 60 * 1000);

    const offerData = {
      merchant,
      appliesToAllProducts,
      discountPercentage,
      title,
      description,
      startDate,
      endDate,
      originalPrices: [],
      isExpired: false,
    };

    if (!appliesToAllProducts) {
      offerData.specificProducts = specificProducts;
    }

    if (req.file) {
      offerData.offerImage = req.file.path;
    }

    const offer = new Offer(offerData);

    // Apply discounts
    const affectedProducts = [];

    if (appliesToAllProducts) {
      const products = await MerchantProduct.find({ merchant });

      for (const product of products) {
        offer.originalPrices.push({
          merchantProduct: product._id,
          originalPrice: product.merchantPrice,
        });

        product.merchantPrice = product.merchantPrice * (1 - discountPercentage / 100);
        await product.save();

        affectedProducts.push(product._id);
      }
    } else {
      console.log(specificProducts, "=========");

      for (const id of specificProducts) {
        console.log('Checking Product ID:', id);

        // Find MerchantProduct where 'product' field equals this id
        const product = await MerchantProduct.findOne({ product: id });

        console.log('Fetched Product:', product);

        if (!product) {
          console.log('Product not found for product field:', id);
          continue;
        }

        offer.originalPrices.push({
          merchantProduct: product._id,
          originalPrice: product.merchantPrice * (1 - discountPercentage / 100)
        });

        await product.save();

        affectedProducts.push(product._id);
      }
    }

    await offer.save();


    // Set timeout to restore prices after 5 mins
    setTimeout(async () => {
      try {
        const currentOffer = await Offer.findById(offer._id);
        if (!currentOffer || currentOffer.isExpired) return;

        for (const priceInfo of currentOffer.originalPrices) {
          const product = await MerchantProduct.findById(priceInfo.merchantProduct);
          if (product) {
            product.merchantPrice = priceInfo.originalPrice;
            await product.save();
          }
        }

        currentOffer.isExpired = true;
        await currentOffer.save();
      } catch (err) {
        console.error('Error restoring prices:', err.message);
      }
    }, 5 * 60 * 1000); // 5 mins

    res.status(201).json({ success: true, offer });
  } catch (error) {
    console.error('Create Offer Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all offers
export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('merchant')
      .populate('specificProducts');
    res.json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get offers applicable on a specific product
export const getOffersByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const offers = await Offer.find({
      $or: [
        { appliesToAllProducts: true },
        { specificProducts: productId }
      ],
      isExpired: false,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })
      .populate('merchant')
      .populate('specificProducts');

    res.json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update offer
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    Object.assign(offer, updateData);
    await offer.save();

    res.json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete offer and rollback prices
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    for (const priceInfo of offer.originalPrices) {
      const mp = await MerchantProduct.findById(priceInfo.merchantProduct);
      if (mp) {
        mp.merchantPrice = priceInfo.originalPrice;
        await mp.save();
      }
    }

    await offer.remove();

    res.json({ success: true, message: 'Offer deleted and prices restored.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
