import express from 'express';
import { getDb } from '../services/firebaseAdmin.js';
import { generateMerchantInsight } from '../services/groqService.js';

const router = express.Router();

// POST /api/insight - Aggregates store performance & queries Groq for growth advice
router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
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
      if (order.upsellAdded) totalUpsellCount++;

      const items = order.items || [];
      const itemNames = items.map(i => i.name).filter(Boolean);

      itemNames.forEach(name => {
        itemCounts[name] = (itemCounts[name] || 0) + 1;
      });

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

    const bestSellers = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topPairs = Object.entries(pairCounts)
      .map(([pair, count]) => {
        const [itemA, itemB] = pair.split(' + ');
        return { itemA, itemB, count };
      })
      .sort((a, b) => b.count - a.count);

    const storeStats = {
      totalOrders: orders.length,
      paidOrdersCount: totalPaidOrders,
      totalRevenue,
      avgOrderValue,
      upsellAcceptanceRate,
      bestSellers,
      topPair: topPairs[0] || null,
    };

    // Ask Groq API for strategic advice using deterministic store summary
    const aiInsightText = await generateMerchantInsight(storeStats, question);

    res.json({
      success: true,
      stats: storeStats,
      insight: aiInsightText,
    });

  } catch (error) {
    console.error('Error generating merchant insight:', error);
    res.status(500).json({ success: false, error: 'Failed to generate merchant insight' });
  }
});

export default router;
