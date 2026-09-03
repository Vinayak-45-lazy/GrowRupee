import express from 'express';
import { getDb } from '../services/firebaseAdmin.js';
import { phraseUpsellSuggestion } from '../services/groqService.js';

const router = express.Router();

// POST /api/recommend - Cart-time co-occurrence analysis + Groq AI phrasing
router.post('/', async (req, res) => {
  try {
    const { cartItems } = req.body; // Array of { productId, name, price }
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, error: 'cartItems array is required' });
    }

    const db = getDb();
    const cartProductIds = new Set(cartItems.map(item => item.productId || item.id));
    const cartProductNames = cartItems.map(item => item.name);

    // Fetch all products from Firestore to get full details later
    const productsSnapshot = await db.collection('products').get();
    const allProductsMap = {};
    productsSnapshot.forEach(doc => {
      allProductsMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    // Fetch past orders to compute deterministic co-occurrence
    const ordersSnapshot = await db.collection('orders').get();
    const coOccurrenceScores = {};

    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      const orderItems = order.items || [];
      const orderProductIds = orderItems.map(i => i.productId || i.id).filter(Boolean);

      // Check if order contains at least one product from cart
      const containsCartProduct = orderProductIds.some(id => cartProductIds.has(id));

      if (containsCartProduct) {
        orderProductIds.forEach(id => {
          // Exclude products already in the customer's cart
          if (!cartProductIds.has(id) && allProductsMap[id]) {
            coOccurrenceScores[id] = (coOccurrenceScores[id] || 0) + 1;
          }
        });
      }
    });

    // Sort products by highest co-occurrence frequency
    const sortedCoOccurrences = Object.entries(coOccurrenceScores)
      .sort(([, countA], [, countB]) => countB - countA);

    let recommendedProduct = null;
    let coOccurrenceCount = 0;

    if (sortedCoOccurrences.length > 0) {
      const [topProductId, count] = sortedCoOccurrences[0];
      recommendedProduct = allProductsMap[topProductId];
      coOccurrenceCount = count;
    } else {
      // Fallback: Pick a top complementary item not in cart (e.g. popular drink or side)
      const nonCartProducts = Object.values(allProductsMap).filter(p => !cartProductIds.has(p.id));
      if (nonCartProducts.length > 0) {
        recommendedProduct = nonCartProducts[0];
        coOccurrenceCount = 5;
      }
    }

    if (!recommendedProduct) {
      return res.json({ success: true, recommendation: null });
    }

    // Pass top co-occurring item to Groq for natural language phrasing
    const aiPhrasedMessage = await phraseUpsellSuggestion(cartProductNames, recommendedProduct);

    res.json({
      success: true,
      recommendation: {
        product: recommendedProduct,
        coOccurrenceCount,
        message: aiPhrasedMessage,
      }
    });

  } catch (error) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recommendation' });
  }
});

export default router;
