import React, { useState, useEffect } from 'react';
import { getCartRecommendation, createPaymentOrder, verifyPayment } from '../services/api';
import UpsellBanner from '../components/UpsellBanner';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, Sparkles, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Cart({ cartItems, onUpdateQty, onRemoveItem, onClearCart, onClose }) {
  const [recommendation, setRecommendation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [acceptedUpsell, setAcceptedUpsell] = useState(null); // Product object
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null); // { success, orderId, paymentId, message }

  // Fetch AI upsell recommendation whenever cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      fetchRecommendation();
    } else {
      setRecommendation(null);
      setAcceptedUpsell(null);
    }
  }, [cartItems]);

  const fetchRecommendation = async () => {
    try {
      setLoadingAi(true);
      const data = await getCartRecommendation(cartItems);
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
      } else {
        setRecommendation(null);
      }
    } catch (err) {
      console.warn('Error fetching cart recommendation:', err);
      setRecommendation(null);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAcceptUpsell = (product) => {
    setAcceptedUpsell(product);
  };

  const handleRemoveUpsell = () => {
    setAcceptedUpsell(null);
  };

  const baseAmount = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const upsellAmount = acceptedUpsell ? acceptedUpsell.price : 0;
  const totalAmount = baseAmount + upsellAmount;

  // Initiate Razorpay Checkout Flow
  const handleRazorpayCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      setCheckoutLoading(true);

      // Step 1: Call Express backend /api/create-order
      const orderPayload = {
        items: cartItems.map((i) => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price })),
        baseAmount,
        upsellAdded: Boolean(acceptedUpsell),
        upsellAmount,
        merchantId: 'merchant_default',
      };

      const orderRes = await createPaymentOrder(orderPayload);

      if (!orderRes.success) {
        throw new Error(orderRes.error || 'Failed to initialize payment');
      }

      const { orderId, razorpayOrderId, amount, currency, keyId, isMock } = orderRes;

      // If Razorpay Key is mock / missing, provide an instant Test Payment dialog simulator
      if (isMock || !window.Razorpay) {
        console.log('⚡ Opening Test Mode Payment Dialog Simulator...');
        setTimeout(async () => {
          const verifyRes = await verifyPayment({
            orderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: 'mock_valid_signature',
            status: 'paid',
          });

          setCheckoutLoading(false);
          setPaymentResult({
            success: verifyRes.success,
            orderId,
            paymentId: `pay_test_${Date.now()}`,
            upsellAdded: Boolean(acceptedUpsell),
            totalAmount,
            message: verifyRes.message || 'Test Payment Processed Successfully!',
          });
          onClearCart();
        }, 1200);
        return;
      }

      // Step 2: Open official Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: amount, // in paise
        currency: currency,
        name: 'Urban Bites & Brews',
        description: acceptedUpsell ? 'Order Payment (Includes AI Upsell)' : 'Order Payment',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Step 3: Verify Payment Signature via Backend
            const verifyRes = await verifyPayment({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setCheckoutLoading(false);
            if (verifyRes.success) {
              setPaymentResult({
                success: true,
                orderId,
                paymentId: response.razorpay_payment_id,
                upsellAdded: Boolean(acceptedUpsell),
                totalAmount,
                message: 'Razorpay Test Payment Verified!',
              });
              onClearCart();
            } else {
              setPaymentResult({
                success: false,
                orderId,
                message: 'Payment verification failed.',
              });
            }
          } catch (err) {
            console.error('Error during signature verification:', err);
            setCheckoutLoading(false);
            setPaymentResult({
              success: false,
              orderId,
              message: 'Failed to verify payment with backend.',
            });
          }
        },
        modal: {
          ondismiss: async function () {
            setCheckoutLoading(false);
            // Record graceful failure / cancellation in backend
            await verifyPayment({ orderId, status: 'cancelled' });
            setPaymentResult({
              success: false,
              orderId,
              message: 'Razorpay test checkout was closed or cancelled.',
            });
          },
        },
        prefill: {
          name: 'Demo Customer',
          email: 'customer@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#0284c7',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutLoading(false);
      alert('Checkout error: ' + err.message);
    }
  };

  // Payment Confirmation View
  if (paymentResult) {
    return (
      <div className="p-6 text-center space-y-6">
        {paymentResult.success ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Payment Successful!</h2>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Your order has been recorded and processed via Razorpay Test Mode.
            </p>

            <div className="glass-panel p-4 rounded-xl text-left text-xs space-y-2 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono text-slate-200">{paymentResult.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="font-mono text-sky-400">{paymentResult.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Paid:</span>
                <span className="font-bold text-white">₹{paymentResult.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Upsell Included:</span>
                <span className={`font-semibold ${paymentResult.upsellAdded ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {paymentResult.upsellAdded ? 'Yes (+₹' + upsellAmount + ')' : 'No'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentResult(null);
                onClose();
              }}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
            >
              Back to Storefront
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white">Payment Unsuccessful</h2>
            <p className="text-xs text-rose-300">{paymentResult.message}</p>

            <button
              onClick={() => setPaymentResult(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-white">Your Food Cart</h2>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-semibold">
            {cartItems.length} items
          </span>
        </div>
      </div>

      {/* Cart Items List */}
      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-700" />
          <p className="text-slate-400 text-sm font-medium">Your cart is empty.</p>
          <p className="text-slate-500 text-xs">Add items from the menu to trigger AI growth recommendations!</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="glass-card p-3 rounded-xl flex items-center justify-between gap-3 border border-slate-800/80"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover bg-slate-900 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-200 truncate">{item.name}</h4>
                <p className="text-xs text-sky-400 font-extrabold">₹{item.price}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => onUpdateQty(item.id, item.qty - 1)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold text-slate-200 px-1">{item.qty}</span>
                <button
                  onClick={() => onUpdateQty(item.id, item.qty + 1)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => onRemoveItem(item.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* AI Recommendation Banner Section */}
          {loadingAi ? (
            <div className="p-4 glass-card rounded-xl text-center space-y-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-indigo-300 font-medium">Groq AI is analyzing order co-occurrence...</p>
            </div>
          ) : (
            recommendation && (
              <UpsellBanner
                recommendation={recommendation}
                isAccepted={Boolean(acceptedUpsell)}
                onAcceptUpsell={handleAcceptUpsell}
                onRemoveUpsell={handleRemoveUpsell}
              />
            )
          )}
        </div>
      )}

      {/* Cart Summary & Razorpay Checkout */}
      {cartItems.length > 0 && (
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Cart Subtotal</span>
              <span className="font-semibold text-slate-200">₹{baseAmount}</span>
            </div>
            {acceptedUpsell && (
              <div className="flex justify-between text-indigo-400 font-medium">
                <span>AI Upsell ({acceptedUpsell.name})</span>
                <span>+₹{upsellAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800/60">
              <span>Total Payable Amount</span>
              <span className="text-sky-400">₹{totalAmount}</span>
            </div>
          </div>

          <button
            onClick={handleRazorpayCheckout}
            disabled={checkoutLoading}
            className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {checkoutLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{totalAmount} with Razorpay Test</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secured by Razorpay Test Sandbox • Instant Signature Verification</span>
          </div>
        </div>
      )}

    </div>
  );
}
