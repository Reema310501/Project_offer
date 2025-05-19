import express from 'express';
import { createOffer, getOffers, updateOffer, deleteOffer, getOffersByProduct } from '../controllers/offerController.js';
import uploadSingleFile from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', uploadSingleFile('offerImage'), createOffer);
router.get('/', getOffers);
router.get('/product/:productId', getOffersByProduct);  // <-- New route to get offers on a product
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

export default router;