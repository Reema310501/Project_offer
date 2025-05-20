import express from 'express';
import cors from 'cors';
import merchantRoutes from './routes/merchantRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/merchants', merchantRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/product', productRoutes);

// Default root route
app.get('/', (req, res) => {
res.send('API is running...');
});

// Handle 404 Not Found
app.use((req, res, next) => {
next(new ApiError(404,`Route not found: ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorHandler);

export default app;