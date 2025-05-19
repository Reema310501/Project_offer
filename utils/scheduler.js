import Offer from '../models/Offer.js';
import MerchantProduct from '../models/MerchantProduct.js';

export const checkOfferExpiry = async () => {
  try {
    const now = new Date();
    const expiredOffers = await Offer.find({ active: true, endDate: { $lte: now } });

    for (const offer of expiredOffers) {
      // Rollback prices
      for (const priceInfo of offer.originalPrices) {
        const mp = await MerchantProduct.findById(priceInfo.merchantProduct);
        if (mp) {
          mp.merchantPrice = priceInfo.originalPrice;
          await mp.save();
        }
      }

      offer.active = false;
      await offer.save();
      console.log(`Offer ${offer._id} expired and prices restored.`);
    }
  } catch (error) {
    console.error('Error checking offer expiry:', error);
  }
};

// Call this function periodically, e.g., every minute:
export const startOfferExpiryScheduler = () => {
  setInterval(checkOfferExpiry, 60 * 1000);
};
