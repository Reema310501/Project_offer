import express from 'express';
import multer from 'multer';
import { addProduct, addProductToMerchant, mapProductsToMerchant } from '../controllers/productController.js';

const router = express.Router();

// Multer configuration for storing uploaded images in 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Add product to main collection with image upload
router.post('/', upload.single('image'), addProduct);

// Add product to merchant collection 
router.post('/merchant/:merchantId/products', upload.single('image'), addProductToMerchant);

// Map multiple products to merchant's product list (no image upload here)
router.post('/merchant/:merchantId/map-products', mapProductsToMerchant);

export default router;
