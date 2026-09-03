import express from 'express';
import { getDb } from '../services/firebaseAdmin.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayClient.js';

const router = express.Router();

// POST /api/create-order - Create Firestore order record + Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { items, baseAmount, upsellAdded = false, upsellAmount = 0, customerId = 'cust_guest', customerName = 'Guest Customer', merchantId = 'merchant_default' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || baseAmount == null) {
      return res.status(400).json({ success: false, error: 'Invalid order payload' });
    }

    const finalAmount = Number(baseAmount) + (upsellAdded ? Number(upsellAmount) : 0);
    const db = getDb();

    // Create preliminary order doc in Firestore
    const orderDoc = {
      merchantId,
      customerId,
      customerName,
      items,
      baseAmount: Number(baseAmount),
      upsellAdded: Boolean(upsellAdded),
      upsellAmount: Number(upsellAmount),
      totalAmount: finalAmount,
      razorpayOrderId: '',
      razorpayPaymentId: '',
      paymentStatus: 'created',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('orders').add(orderDoc);
    const orderId = docRef.id;

    // Call Razorpay Orders API
    const rzpOrder = await createRazorpayOrder(finalAmount, 'INR', orderId);

    // Save Razorpay order ID back to Firestore doc
    await db.collection('orders').doc(orderId).update({
      razorpayOrderId: rzpOrder.id,
    });

    res.json({
      success: true,
      orderId,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      isMock: rzpOrder.isMock,
    });

  } catch (error) {
    console.error('Error creating checkout order:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
});

// POST /api/verify-payment - Signature verification & status update
router.post('/verify-payment', async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, status } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId is required' });
    }

    const db = getDb();
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Handle payment cancellation or failure from frontend
    if (status === 'failed' || status === 'cancelled') {
      await orderRef.update({
        paymentStatus: 'failed',
        updatedAt: new Date().toISOString(),
      });
      return res.json({ success: false, status: 'failed', message: 'Payment was cancelled or failed' });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature({
      razorpay_order_id: razorpay_order_id || orderDoc.data().razorpayOrderId,
      razorpay_payment_id: razorpay_payment_id || `pay_${Date.now()}`,
      razorpay_signature: razorpay_signature || 'mock_sig',
    });

    if (isValid) {
      await orderRef.update({
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id || `pay_test_${Date.now()}`,
        updatedAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        status: 'paid',
        message: 'Payment verified and order recorded successfully!',
        orderId,
      });
    } else {
      await orderRef.update({
        paymentStatus: 'failed',
        updatedAt: new Date().toISOString(),
      });

      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Invalid payment signature verification',
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});

export default router;
