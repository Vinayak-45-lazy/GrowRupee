import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import recommendRouter from './routes/recommend.js';
import insightRouter from './routes/insight.js';
import paymentRouter from './routes/payment.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173']
  : '*';

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/insight', insightRouter);
app.use('/api', paymentRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'PayPilot AI Backend Server',
    timestamp: new Date().toISOString(),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 PayPilot AI Backend Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});
