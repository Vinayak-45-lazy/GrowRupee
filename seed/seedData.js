import { getDb, saveMockData, mockStore } from '../server/services/firebaseAdmin.js';

async function seedDatabase() {
  console.log('🌱 Starting PayPilot AI Database Seeding Process...');

  const db = getDb();

  // 1. Seed Merchant Profile
  const merchantId = 'merchant_default';
  const merchantData = {
    name: 'Alex Rivera',
    email: 'merchant@paypilot.ai',
    storeName: 'Urban Bites & Brews',
    category: 'Gourmet Fast Casual',
    currency: 'INR',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  await db.collection('merchants').doc(merchantId).set(merchantData);
  console.log('✅ Merchant seeded: Urban Bites & Brews');

  // 2. Seed Products
  const products = [
    {
      id: 'prod_burger_01',
      merchantId,
      name: 'Gourmet Cheeseburger',
      price: 180,
      category: 'Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_fries_02',
      merchantId,
      name: 'Crispy Garlic Fries',
      price: 90,
      category: 'Sides',
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_coke_03',
      merchantId,
      name: 'Chilled Coca-Cola (500ml)',
      price: 45,
      category: 'Beverages',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_pizza_04',
      merchantId,
      name: 'Margherita Woodfired Pizza',
      price: 280,
      category: 'Pizzas',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_garlicbread_05',
      merchantId,
      name: 'Cheesy Garlic Breadsticks',
      price: 120,
      category: 'Sides',
      imageUrl: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_wings_06',
      merchantId,
      name: 'Spicy Buffalo Wings (6pcs)',
      price: 210,
      category: 'Appetizers',
      imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_lavacake_07',
      merchantId,
      name: 'Chocolate Lava Cake',
      price: 110,
      category: 'Desserts',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_coffee_08',
      merchantId,
      name: 'Iced Hazelnut Cold Coffee',
      price: 95,
      category: 'Beverages',
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    },
  ];

  for (const prod of products) {
    const { id, ...data } = prod;
    await db.collection('products').doc(id).set(data);
  }
  console.log(`✅ Seeded ${products.length} catalog products`);

  // 3. Generate 75 Historical Orders with Strong Co-occurrence Patterns
  console.log('🔄 Generating 75 realistic order histories with co-occurrence data...');

  if (mockStore) mockStore.orders = {};

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const createdOrders = [];

  const burgerItem = { productId: 'prod_burger_01', name: 'Gourmet Cheeseburger', qty: 1, price: 180 };
  const friesItem = { productId: 'prod_fries_02', name: 'Crispy Garlic Fries', qty: 1, price: 90 };
  const cokeItem = { productId: 'prod_coke_03', name: 'Chilled Coca-Cola (500ml)', qty: 1, price: 45 };
  const pizzaItem = { productId: 'prod_pizza_04', name: 'Margherita Woodfired Pizza', qty: 1, price: 280 };
  const gBreadItem = { productId: 'prod_garlicbread_05', name: 'Cheesy Garlic Breadsticks', qty: 1, price: 120 };
  const wingsItem = { productId: 'prod_wings_06', name: 'Spicy Buffalo Wings (6pcs)', qty: 1, price: 210 };
  const cakeItem = { productId: 'prod_lavacake_07', name: 'Chocolate Lava Cake', qty: 1, price: 110 };
  const coffeeItem = { productId: 'prod_coffee_08', name: 'Iced Hazelnut Cold Coffee', qty: 1, price: 95 };

  const customerNames = [
    "Ramesh Sharma", "Priya Patel", "Rahul Verma", "Ananya Singh", "Amit Kumar",
    "Neha Gupta", "Karan Malhotra", "Deepika Joshi", "Siddharth Rao", "Rohan Mehta",
    "Vikram Das", "Pooja Hegde", "Aditya Nair", "Sneha Iyer", "Tanvi Kulkarni",
    "Arjun Reddy", "Meera Sen", "Varun Kapoor", "Shreya Roy", "Gautam Gambhir",
    "Simran Kaur", "Abhinav Bindra", "Nikhil D'Souza", "Ritika Roy", "Aakash Banerjee"
  ];

  for (let i = 1; i <= 75; i++) {
    const orderDate = new Date(now - (Math.floor(Math.random() * 28) * dayMs + Math.floor(Math.random() * dayMs))).toISOString();
    const custIdx = (i - 1) % customerNames.length;
    const customerId = `cust_${100 + custIdx}`;
    const customerName = customerNames[custIdx];

    let items = [];
    let upsellAdded = false;
    let upsellAmount = 0;
    let baseAmount = 0;

    // Distribute into realistic order patterns
    const randPattern = Math.random();

    if (randPattern < 0.40) {
      // Pattern 1: Burger + Fries (Frequent Co-occurrence) + Coke Upsell
      items = [burgerItem, friesItem];
      baseAmount = burgerItem.price + friesItem.price;

      if (Math.random() < 0.65) { // 65% upsell acceptance
        upsellAdded = true;
        upsellAmount = cokeItem.price;
        items.push(cokeItem);
      }
    } else if (randPattern < 0.70) {
      // Pattern 2: Pizza + Garlic Bread + Coffee
      items = [pizzaItem, gBreadItem];
      baseAmount = pizzaItem.price + gBreadItem.price;

      if (Math.random() < 0.55) { // 55% upsell acceptance
        upsellAdded = true;
        upsellAmount = coffeeItem.price;
        items.push(coffeeItem);
      }
    } else if (randPattern < 0.88) {
      // Pattern 3: Wings + Coke + Lava Cake
      items = [wingsItem, cokeItem];
      baseAmount = wingsItem.price + cokeItem.price;

      if (Math.random() < 0.50) {
        upsellAdded = true;
        upsellAmount = cakeItem.price;
        items.push(cakeItem);
      }
    } else {
      // Pattern 4: Solo Pizza or Burger
      items = Math.random() > 0.5 ? [burgerItem] : [pizzaItem];
      baseAmount = items[0].price;
    }

    // Payment status distribution: ~85% paid, ~10% created, ~5% failed
    let paymentStatus = 'paid';
    const statusRand = Math.random();
    if (statusRand > 0.95) paymentStatus = 'failed';
    else if (statusRand > 0.85) paymentStatus = 'created';

    const razorpayOrderId = `order_seed_${Date.now()}_${i}`;
    const razorpayPaymentId = paymentStatus === 'paid' ? `pay_seed_${Date.now()}_${i}` : '';

    const orderDoc = {
      merchantId,
      customerId,
      customerName,
      items,
      baseAmount,
      upsellAdded,
      upsellAmount,
      totalAmount: baseAmount + (upsellAdded ? upsellAmount : 0),
      razorpayOrderId,
      razorpayPaymentId,
      paymentStatus,
      createdAt: orderDate,
    };

    const docId = `ord_seed_${1000 + i}`;
    await db.collection('orders').doc(docId).set(orderDoc);
    createdOrders.push(orderDoc);
  }

  saveMockData(mockStore);
  console.log(`🎉 Seeding complete! 75 order records populated for merchant "${merchantData.storeName}".`);
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed:', err);
});
