import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

let groq = null;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_your_groq_api_key_here') {
  try {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log('✅ Connected to Groq API');
  } catch (err) {
    console.warn('❌ Groq API init failed:', err.message);
  }
} else {
  console.log('ℹ️ GROQ_API_KEY missing or placeholder in .env — using intelligent local templates for AI responses.');
}

/**
 * Uses Groq to phrase an upsell suggestion naturally based on deterministic co-occurrence data.
 */
export const phraseUpsellSuggestion = async (cartProductNames, recommendedProduct) => {
  const defaultPhrase = `Pairs perfectly with your ${cartProductNames.join(', ')} — add ${recommendedProduct.name} for just ₹${recommendedProduct.price}!`;

  if (!groq) {
    return defaultPhrase;
  }

  try {
    const prompt = `You are a friendly, high-converting food sales assistant.
The customer has the following item(s) in their cart: ${cartProductNames.join(', ')}.
Based on past order history, the top item frequently bought together with their cart is: "${recommendedProduct.name}" priced at ₹${recommendedProduct.price}.

Write a single catchy, appetizing 1-sentence upsell offer encouraging them to add "${recommendedProduct.name}" for ₹${recommendedProduct.price}. 
Keep it under 18 words. Do not use quotes or jargon. Focus on taste, value, or perfect pairing.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 60,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    return responseText || defaultPhrase;
  } catch (err) {
    console.warn('[Groq API Warning] Error generating recommendation phrase:', err.message);
    return defaultPhrase;
  }
};

/**
 * Uses Groq to generate executive merchant growth advice based on aggregated store data.
 */
export const generateMerchantInsight = async (storeStats, merchantQuestion = '') => {
  if (!groq) {
    return generateFallbackInsight(storeStats, merchantQuestion);
  }

  try {
    const statsSummary = `
- Total Store Revenue: ₹${storeStats.totalRevenue.toLocaleString()}
- Total Orders: ${storeStats.totalOrders}
- Average Order Value (AOV): ₹${storeStats.avgOrderValue}
- Upsell Acceptance Rate: ${storeStats.upsellAcceptanceRate}%
- Top Best-Selling Products: ${storeStats.bestSellers.map(p => `${p.name} (${p.count} sold)`).join(', ')}
- Top Co-occurrence Pair (Bought Together): ${storeStats.topPair ? `${storeStats.topPair.itemA} + ${storeStats.topPair.itemB} (${storeStats.topPair.count} orders)` : 'N/A'}
`;

    const userPrompt = merchantQuestion 
      ? `Merchant Question: "${merchantQuestion}"\n\nStore Context Data:\n${statsSummary}`
      : `Provide key growth recommendations for the merchant based on their store performance data:\n${statsSummary}`;

    const systemPrompt = `You are PayPilot AI, an elite AI Merchant Growth Advisor for food & product businesses.
Analyze the provided store performance summary deterministically. 
Provide 3 concise, actionable, high-impact growth strategies.
Focus on bundling opportunities, boosting Average Order Value (AOV), and optimizing top co-occurring items.
Format your output cleanly in Markdown with bullet points and bold highlights. Keep it friendly, realistic, and inspiring.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 450,
    });

    return completion.choices[0]?.message?.content || generateFallbackInsight(storeStats, merchantQuestion);
  } catch (err) {
    console.warn('[Groq API Warning] Error generating merchant insight:', err.message);
    return generateFallbackInsight(storeStats, merchantQuestion);
  }
};

function generateFallbackInsight(storeStats, question) {
  const topPairStr = storeStats.topPair ? `${storeStats.topPair.itemA} & ${storeStats.topPair.itemB}` : 'Burger & Garlic Fries';
  return `### 🚀 PayPilot AI Growth Action Plan

Based on your real store data (Revenue: **₹${storeStats.totalRevenue?.toLocaleString()}**, AOV: **₹${storeStats.avgOrderValue}**, Upsell Acceptance: **${storeStats.upsellAcceptanceRate}%**):

1. **Leverage Strong Co-Occurrence Pairs**:
   - **${topPairStr}** are bought together in over ${storeStats.topPair?.count || 25} past orders.
   - *Strategy*: Create a dedicated **Combo Meal** at checkout discounted by 8%. This will push your current AOV of ₹${storeStats.avgOrderValue} above ₹${Math.round(storeStats.avgOrderValue * 1.15)}.

2. **Capitalize on Checkout Upsells**:
   - Your current upsell conversion is **${storeStats.upsellAcceptanceRate}%**.
   - *Strategy*: Add complementary beverages or sides priced under ₹60 to increase impulse add-ons by 20%.

3. **Promote Best Sellers**:
   - Best sellers like **${storeStats.bestSellers?.[0]?.name || 'Gourmet Burger'}** account for significant volume.
   - *Strategy*: Feature them at the top of your digital storefront with dynamic high-converting tags.`;
}
