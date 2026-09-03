import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

let razorpayInstance = null;
let isMockRazorpay = false;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_ID !== 'rzp_test_your_key_id_here') {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Connected to Real Razorpay Test API');
  } catch (err) {
    console.warn('❌ Razorpay client init failed, switching to mock mode:', err.message);
    isMockRazorpay = true;
  }
} else {
  console.log('ℹ️ Razorpay keys missing or default in .env — using Mock Razorpay Order & Payment verifier for local testing.');
  isMockRazorpay = true;
}

/**
 * Creates a Razorpay order or returns a mock order for test mode demo.
 * @param {number} amountInRupees - Amount in INR (e.g. 250)
 * @param {string} currency - 'INR'
 * @param {string} receiptId - Unique order receipt ID
 */
export const createRazorpayOrder = async (amountInRupees, currency = 'INR', receiptId = '') => {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (razorpayInstance && !isMockRazorpay) {
    const options = {
      amount: amountInPaise,
      currency,
      receipt: receiptId || `receipt_${Date.now()}`,
      payment_capture: 1,
    };
    const order = await razorpayInstance.orders.create(options);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      isMock: false,
    };
  }

  // Mock Order fallback when keys aren't added yet
  const mockId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  return {
    id: mockId,
    amount: amountInPaise,
    currency,
    isMock: true,
  };
};

/**
 * Verifies Razorpay payment signature
 */
export const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (razorpay_order_id.startsWith('order_mock_') || isMockRazorpay) {
    // For mock orders, allow test validation
    return true;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  return generatedSignature === razorpay_signature;
};

export const getIsMockRazorpay = () => isMockRazorpay;
