import { NextResponse } from 'next/server';

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface P {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  stock: number;
  seller: string;
  nameAm: string;
  ratingCount: number;
}

const etb = (n: number) => 'ETB ' + Math.round(n).toLocaleString('en-US');

export async function POST(req: Request) {
  const { messages = [], cart = [], user = null, orders = [] } = await req.json();

  const [products, cfg]: [P[], any] = await Promise.all([
    fetch(`${API}/products`, { cache: 'no-store' }).then((r) => r.json()).catch(() => []),
    fetch(`${API}/config`, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({
      cities: {},
      freeShippingOver: 5000,
    })),
  ]);

  const last: string = messages[messages.length - 1]?.content || '';
  const byId = (ids: string[]) =>
    ids
      .map((i) => products.find((p) => p.id === i))
      .filter(Boolean)
      .slice(0, 3) as P[];

  const key = process.env.ANTHROPIC_API_KEY;
  if (key && products.length) {
    try {
      const system = `You are "Hub", the smart shopping assistant for ShopHub, an Ethiopian online marketplace. Reply in the user's language (English or Amharic), warm, helpful, and concise (max 3 short sentences). Currency is ETB.
Facts:
- Nationwide fast delivery: Addis Ababa is same day; other cities 1–4 days. Free delivery over ${etb(cfg.freeShippingOver)}.
- Payments: Telebirr (SuperApp QR & *127#), CBE Birr (*847#), Card/Chapa, and Cash on Delivery.
- 14-day buyer protection & easy returns.
- Customer: ${user || 'guest'}.
- Cart: ${cart.join(', ') || 'empty'}.
- Customer Orders: ${orders.map((o: any) => `${o.code} (${o.status})`).join(', ') || 'None'}.
Catalog:\n${products
        .map(
          (p) =>
            `[${p.id}] ${p.name} | ${p.category} | ${etb(p.price)} (was ${etb(p.oldPrice)}) | rating ${p.rating} | ${
              p.stock > 0 ? p.stock + ' in stock' : 'OUT OF STOCK'
            }`,
        )
        .join('\n')}
Respond ONLY with valid JSON: {"reply": string, "product_ids": string[] (0-3 ids)}`;

      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
          max_tokens: 500,
          system,
          messages,
        }),
      });

      const j = await r.json();
      const text: string = (j.content || []).map((c: any) => c.text || '').join('');
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      if (typeof parsed.reply === 'string') {
        return NextResponse.json({
          reply: parsed.reply,
          products: byId(Array.isArray(parsed.product_ids) ? parsed.product_ids : []),
        });
      }
    } catch {
      /* fallback to built-in smart assistant */
    }
  }

  return NextResponse.json(smartFallback(last, products, cfg, orders, user));
}

/** Smart built-in assistant when no external API key is configured */
function smartFallback(q: string, products: P[], cfg: any, orders: any[], user: string | null) {
  const l = q.toLowerCase();

  // Greetings in English or Amharic
  if (/^(hi|hello|hey|selam|ሰላም|ጤና ይስጥልኝ)/i.test(l.trim())) {
    return {
      reply: `ሰላም! Hello ${
        user ? user.split(' ')[0] : 'shopper'
      }! I am **Hub**, your ShopHub smart AI shopping assistant. How can I help you discover authentic Ethiopian products today? You can ask for coffee, gifts, tech deals, or delivery info.`,
      products: products.filter((p) => p.stock > 0 && p.rating >= 4.5).slice(0, 3),
    };
  }

  // Delivery & shipping queries
  if (/deliver|ship|when|arrive|how long|eta|ማድረስ|መቼ/i.test(l)) {
    return {
      reply: `🚚 We deliver nationwide across Ethiopia! **Addis Ababa** orders arrive **same-day** (${
        cfg.cities?.['Addis Ababa']?.fee ? etb(cfg.cities['Addis Ababa'].fee) : 'ETB 120'
      }). Regional cities like Adama, Hawassa, and Bahir Dar take 1–3 days. **Free delivery on orders over ${etb(
        cfg.freeShippingOver,
      )}**!`,
    };
  }

  // Payment methods
  if (/pay|telebirr|cbe|card|cash|cod|ብር|ክፍያ/i.test(l)) {
    return {
      reply: `💳 We support modern Ethiopian payments: **Telebirr** (SuperApp QR & *127#), **CBE Birr** (*847#), **Debit Cards**, and **Cash on Delivery (COD)**. Choose what works best for you at checkout!`,
    };
  }

  // Return policy
  if (/return|refund|warranty|መለስ/i.test(l)) {
    return {
      reply: `🛡️ All ShopHub purchases are backed by our **14-day Buyer Protection**. If your item is damaged or not as described, return it for a 100% refund or replacement.`,
    };
  }

  // Order status
  if (/order|track|where is my|ትዕዛዝ/i.test(l)) {
    if (!user) {
      return { reply: 'Please sign in to your ShopHub account to track your orders in real-time.' };
    }
    if (orders.length > 0) {
      const top = orders[0];
      return {
        reply: `📦 Your latest order **${top.code}** is currently **${top.status.toUpperCase()}** for **${etb(
          top.total,
        )}** in ${top.city}. Track the animated route on the My Orders page!`,
      };
    }
    return {
      reply: 'You have no active orders at the moment. Browse our catalog to place your first order!',
    };
  }

  // Coffee queries
  if (/coffee|buna|tomoca|yirgacheffe|sidama|ቡና/i.test(l)) {
    const coffee = products.filter(
      (p) =>
        p.stock > 0 &&
        (p.category.toLowerCase().includes('coffee') || p.name.toLowerCase().includes('coffee') || p.nameAm?.includes('ቡና')),
    );
    return {
      reply: `☕ Ethiopia is the birthplace of coffee! Here are our finest single-origin roasts and beans:`,
      products: coffee.slice(0, 3),
    };
  }

  // Fashion / Kemis
  if (/fashion|dress|kemis|netela|clothes|habesha|ልብስ|ቀሚስ/i.test(l)) {
    const fashion = products.filter(
      (p) =>
        p.stock > 0 &&
        (p.category.toLowerCase().includes('fashion') || p.name.toLowerCase().includes('kemis') || p.name.toLowerCase().includes('dress')),
    );
    return {
      reply: `👗 Hand-woven Ethiopian fashion and authentic traditional crafts from trusted artisans:`,
      products: fashion.slice(0, 3),
    };
  }

  // Budget search (e.g. "under 2000", "below 5000 birr")
  const m = l.match(/(\d[\d,]*)/);
  const max = m ? +m[1].replace(/,/g, '') : Infinity;

  const words = l
    .replace(/under|below|birr|etb|\d[\d,]*/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/gift|cheap|best|the|for|good|want|need|show|find/.test(w));

  let matched = products.filter(
    (p) =>
      p.stock > 0 &&
      p.price <= max &&
      (!words.length || words.some((w) => `${p.name} ${p.category} ${p.seller}`.toLowerCase().includes(w))),
  );

  matched = /cheap|gift/.test(l)
    ? matched.sort((a, b) => a.price - b.price)
    : matched.sort((a, b) => b.rating - a.rating);

  if (matched.length > 0) {
    return {
      reply: `✨ Here are the top recommendations matching your criteria${
        max !== Infinity ? ` under ${etb(max)}` : ''
      }:`,
      products: matched.slice(0, 3),
    };
  }

  return {
    reply: `I could not find exact products matching that query. Try asking for **"Ethiopian coffee"**, **"phones under 10000"**, or **"gifts under 2000"**!`,
    products: products.filter((p) => p.stock > 0).slice(0, 3),
  };
}
