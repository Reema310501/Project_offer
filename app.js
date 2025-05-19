import express from 'express';
import cors from 'cors';
import merchantRoutes from './routes/merchantRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import productRoutes from './routes/productRoutes.js'
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/merchants', merchantRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/product',productRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;

