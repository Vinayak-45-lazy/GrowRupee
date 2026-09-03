import express from 'express';
import { getDb } from '../services/firebaseAdmin.js';

const router = express.Router();

// GET /api/orders - Retrieve orders list
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('orders').get();
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    // Sort by createdAt descending
    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/stats - Compute deterministic store analytics
router.get('/stats', async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('orders').get();
    
    const orders = [];
    snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));

    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    
    let totalRevenue = 0;
    let totalUpsellCount = 0;
    const itemCounts = {};
    const pairCounts = {};

    paidOrders.forEach(order => {
      const orderTotal = (order.baseAmount || 0) + (order.upsellAmount || 0);
      totalRevenue += orderTotal;

      if (order.upsellAdded) {
        totalUpsellCount++;
      }

      const items = order.items || [];
      const itemNames = items.map(i => i.name).filter(Boolean);

      // Count product frequencies
      itemNames.forEach(name => {
        itemCounts[name] = (itemCounts[name] || 0) + 1;
      });

      // Count item pair co-occurrences
      for (let i = 0; i < itemNames.length; i++) {
        for (let j = i + 1; j < itemNames.length; j++) {
          const pairKey = [itemNames[i], itemNames[j]].sort().join(' + ');
          pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
        }
      }
    });

    const totalPaidOrders = paidOrders.length;
    const avgOrderValue = totalPaidOrders > 0 ? Math.round(totalRevenue / totalPaidOrders) : 0;
    const upsellAcceptanceRate = totalPaidOrders > 0 ? Math.round((totalUpsellCount / totalPaidOrders) * 100) : 0;

    // Best sellers
    const bestSellers = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Co-occurrence pair
    const topPairs = Object.entries(pairCounts)
      .map(([pair, count]) => {
        const [itemA, itemB] = pair.split(' + ');
        return { itemA, itemB, count };
      })
      .sort((a, b) => b.count - a.count);

    const topPair = topPairs[0] || null;

    res.json({
      success: true,
      stats: {
        totalOrders: orders.length,
        paidOrdersCount: totalPaidOrders,
        totalRevenue,
        avgOrderValue,
        upsellAcceptanceRate,
        bestSellers,
        topPair,
      }
    });
  } catch (error) {
    console.error('Error computing store stats:', error);
    res.status(500).json({ success: false, error: 'Failed to compute store stats' });
  }
});

export default router;
