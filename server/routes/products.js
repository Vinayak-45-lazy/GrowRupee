import express from 'express';
import { getDb } from '../services/firebaseAdmin.js';

const router = express.Router();

// GET /api/products - List all products
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('products').get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const { name, price, category, imageUrl, merchantId = 'merchant_default' } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    const db = getDb();
    const newProduct = {
      merchantId,
      name,
      price: Number(price),
      category: category || 'General',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('products').add(newProduct);
    res.status(201).json({ success: true, product: { id: docRef.id, ...newProduct } });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

export default router;
