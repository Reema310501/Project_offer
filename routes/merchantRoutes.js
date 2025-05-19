import express from 'express';
import { addMerchant, getMerchants } from '../controllers/merchantController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyAdmin, addMerchant);
router.get('/', verifyAdmin, getMerchants);

export default router;
