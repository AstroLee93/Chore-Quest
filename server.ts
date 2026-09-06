import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { FamilyDatabase } from './src/types';
import { DEFAULT_SEED_DATA } from './src/utils/storage';

dotenv.config();

const app = express();
const PORT = 3000;

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback estimation heuristic if Gemini API is unreachable or not configured
function getFallbackEstimate(name: string, quantity?: string): number {
  const lower = (name || '').toLowerCase();
  let basePrice = 3.49;

  if (lower.includes('milk') || lower.includes('cream')) basePrice = 3.99;
  else if (lower.includes('egg')) basePrice = 3.49;
  else if (lower.includes('bread') || lower.includes('bagel') || lower.includes('bun') || lower.includes('tortilla')) basePrice = 3.29;
  else if (lower.includes('chicken') || lower.includes('beef') || lower.includes('steak') || lower.includes('pork') || lower.includes('salmon') || lower.includes('fish') || lower.includes('meat')) basePrice = 7.99;
  else if (lower.includes('apple') || lower.includes('banana') || lower.includes('orange') || lower.includes('lemon') || lower.includes('berry') || lower.includes('grape') || lower.includes('fruit')) basePrice = 3.99;
  else if (lower.includes('lettuce') || lower.includes('spinach') || lower.includes('tomato') || lower.includes('onion') || lower.includes('potato') || lower.includes('carrot') || lower.includes('broccoli') || lower.includes('vegetable')) basePrice = 2.49;
  else if (lower.includes('cheese') || lower.includes('butter') || lower.includes('yogurt')) basePrice = 4.49;
  else if (lower.includes('cereal') || lower.includes('oat')) basePrice = 4.29;
  else if (lower.includes('chip') || lower.includes('snack') || lower.includes('cracker') || lower.includes('cookie') || lower.includes('candy') || lower.includes('popcorn')) basePrice = 3.99;
  else if (lower.includes('coffee') || lower.includes('tea')) basePrice = 6.99;
  else if (lower.includes('juice') || lower.includes('soda') || lower.includes('beverage') || lower.includes('drink')) basePrice = 3.49;
  else if (lower.includes('pasta') || lower.includes('rice') || lower.includes('noodle') || lower.includes('sauce') || lower.includes('can') || lower.includes('beans')) basePrice = 2.79;
  else if (lower.includes('paper') || lower.includes('detergent') || lower.includes('soap') || lower.includes('trash') || lower.includes('cleaner') || lower.includes('foil')) basePrice = 6.99;

  // Simple quantity scaling if 2x, 3x, etc.
  if (quantity) {
    const qMatch = quantity.match(/^(\d+(?:\.\d+)?)/);
    if (qMatch) {
      const qNum = parseFloat(qMatch[1]);
      if (qNum > 1 && qNum <= 10 && !quantity.toLowerCase().includes('oz') && !quantity.toLowerCase().includes('g') && !quantity.toLowerCase().includes('tbsp') && !quantity.toLowerCase().includes('tsp') && !quantity.toLowerCase().includes('cup')) {
        basePrice = Math.min(50, basePrice * qNum);
      }
    }
  }

  return Number(basePrice.toFixed(2));
}

// Resilient Gemini model caller with exponential retry and model fallback cascade
async function callGeminiWithFallback<T>(
  ai: GoogleGenAI,
  callFn: (modelName: string) => Promise<T>,
  preferredModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.1-pro-preview']
): Promise<T> {
  let lastError: any = null;

  for (const model of preferredModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await callFn(model);
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err || '');
        const isTemporary =
          errStr.includes('503') ||
          errStr.includes('UNAVAILABLE') ||
          errStr.includes('high demand') ||
          errStr.includes('429') ||
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('overloaded');

        console.warn(`[Server] Model ${model} (attempt ${attempt}) encountered: ${errStr.slice(0, 150)}`);

        if (isTemporary && attempt === 1) {
          // Wait 1000ms before retrying same model
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        // Move on to next candidate model in the cascade
        break;
      }
    }
  }

  throw lastError;
}

app.use(express.json({ limit: '25mb' }));

// File persistence path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'chorequest_database.json');

// In-memory active database
let currentDatabase: FamilyDatabase = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));

// Ensure data folder and load persisted data if available
function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.kids && parsed.chores && parsed.categories && parsed.settings) {
        if (!parsed.events || parsed.events.length === 0) {
          parsed.events = DEFAULT_SEED_DATA.events || [];
        }
        if (!parsed.weatherForecasts) {
          parsed.weatherForecasts = {};
        }
        currentDatabase = parsed;
        console.log('[Server] Loaded persisted database from disk.');
      }
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(currentDatabase, null, 2), 'utf-8');
      console.log('[Server] Initialized new database file with seed data.');
    }
  } catch (err) {
    console.error('[Server] Failed to load database from disk, using default seed:', err);
  }
}

initDatabase();

function persistDatabaseToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(currentDatabase, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to write database to disk:', err);
  }
}

// SSE (Server-Sent Events) clients for real-time synchronization
type SSEClient = {
  id: string;
  res: express.Response;
};

const sseClients: SSEClient[] = [];

function broadcastDatabaseUpdate(updatedDb: FamilyDatabase, senderId?: string) {
  currentDatabase = updatedDb;
  persistDatabaseToDisk();

  const payload = JSON.stringify({
    type: 'DATABASE_UPDATED',
    database: currentDatabase,
    senderId: senderId || null,
    timestamp: Date.now(),
  });

  const deadClientIds: string[] = [];
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (err) {
      deadClientIds.push(client.id);
    }
  });

  if (deadClientIds.length > 0) {
    for (let i = sseClients.length - 1; i >= 0; i--) {
      if (deadClientIds.includes(sseClients[i].id)) {
        sseClients.splice(i, 1);
      }
    }
  }
}

// --- REST API Endpoints ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), connectedClients: sseClients.length });
});

// 2. Fetch current shared database
app.get('/api/database', (req, res) => {
  res.json(currentDatabase);
});

// 3. Save / Update shared database (broadcasts to all other sessions)
app.post('/api/database', (req, res) => {
  const updated = req.body.database as FamilyDatabase;
  const senderId = (req.body.senderId as string) || req.headers['x-client-id'] as string || undefined;

  if (!updated || !Array.isArray(updated.kids) || !Array.isArray(updated.chores) || !updated.settings) {
    res.status(400).json({ error: 'Invalid database payload structure' });
    return;
  }

  // Ensure isDefaultPin state is respected
  if (updated.settings.parentPin !== '1234') {
    updated.settings.isDefaultPin = false;
  }

  broadcastDatabaseUpdate(updated, senderId);
  res.json({ success: true, database: currentDatabase });
});

// 4. Verify parent PIN securely
app.post('/api/verify-pin', (req, res) => {
  const { pin } = req.body;
  const isCorrect = pin === currentDatabase.settings.parentPin;
  res.json({
    valid: isCorrect,
    isDefaultPin: currentDatabase.settings.isDefaultPin ?? (currentDatabase.settings.parentPin === '1234'),
  });
});

// 5. Change PIN endpoint
app.post('/api/change-pin', (req, res) => {
  const { currentPin, newPin, senderId } = req.body;

  if (!newPin || typeof newPin !== 'string' || newPin.length < 4) {
    res.status(400).json({ error: 'New PIN must be at least 4 digits.' });
    return;
  }

  if (currentPin !== currentDatabase.settings.parentPin) {
    res.status(401).json({ error: 'Incorrect current parent PIN.' });
    return;
  }

  currentDatabase.settings.parentPin = newPin;
  currentDatabase.settings.isDefaultPin = newPin === '1234' ? false : false; // Marked as explicitly changed

  broadcastDatabaseUpdate(currentDatabase, senderId);
  res.json({ success: true, isDefaultPin: false });
});

// 6. Fetch external iCal/ICS calendar feed (e.g. Google Calendar Secret iCal Address or webcal link)
app.get('/api/calendar/fetch-ics', async (req, res) => {
  const feedUrl = req.query.url as string;

  if (!feedUrl || typeof feedUrl !== 'string') {
    res.status(400).json({ error: 'Missing "url" query parameter.' });
    return;
  }

  try {
    // Normalize webcal:// to https://
    let targetUrl = feedUrl.trim();
    if (targetUrl.startsWith('webcal://')) {
      targetUrl = 'https://' + targetUrl.substring(9);
    } else if (targetUrl.startsWith('http://')) {
      targetUrl = 'https://' + targetUrl.substring(7);
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'ChoreQuest-CalendarSync/1.0 (Mozilla/5.0)',
        'Accept': 'text/calendar, text/plain, */*',
      },
    });

    if (!response.ok) {
      res.status(response.status).json({
        error: `Remote calendar server returned HTTP ${response.status}: ${response.statusText}`,
      });
      return;
    }

    const text = await response.text();
    if (!text.includes('BEGIN:VCALENDAR')) {
      res.status(400).json({ error: 'The provided URL does not return a valid iCalendar (.ics) feed.' });
      return;
    }

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.send(text);
  } catch (err: any) {
    console.error('[Server] Error fetching iCal feed:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch external calendar feed.' });
  }
});

// 7. SSE Real-time stream endpoint
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const client: SSEClient = { id: clientId, res };
  sseClients.push(client);

  // Send initial state upon connection
  res.write(
    `data: ${JSON.stringify({
      type: 'CONNECTED',
      clientId,
      database: currentDatabase,
      timestamp: Date.now(),
    })}\n\n`
  );

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const index = sseClients.findIndex((c) => c.id === clientId);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// 8. Single Grocery Item Price Estimation via Gemini AI
app.post('/api/grocery/estimate-price', async (req, res) => {
  const { name, quantity, knownPrices } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Item name is required' });
    return;
  }

  const trimmedName = name.trim();
  const lowerName = trimmedName.toLowerCase();
  const trimmedQty = quantity && typeof quantity === 'string' ? quantity.trim() : '';

  // Check known receipt price history first if provided
  if (knownPrices && typeof knownPrices === 'object' && knownPrices[lowerName] !== undefined) {
    const historical = Number(knownPrices[lowerName]);
    if (!isNaN(historical) && historical > 0) {
      res.json({
        estimatedCost: Number(historical.toFixed(2)),
        currency: 'USD',
        priceSource: 'receipt',
      });
      return;
    }
  }

  const ai = getGenAI();
  const qtyText = trimmedQty ? `${trimmedQty} of ` : '';
  const prompt = `Estimate the typical current US grocery store price in USD for ${qtyText}${trimmedName}. Reply with ONLY a number (e.g. 3.49). If unsure, give a reasonable average.`;

  if (!ai) {
    const fallback = getFallbackEstimate(trimmedName, trimmedQty);
    res.json({
      estimatedCost: fallback,
      currency: 'USD',
      priceSource: 'ai',
      fallback: true,
    });
    return;
  }

  try {
    const response = await callGeminiWithFallback(ai, async (modelName) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
    });

    const text = response.text?.trim() || '';
    const match = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
    let price = match ? parseFloat(match[1]) : 0;
    if (isNaN(price) || price <= 0) {
      price = getFallbackEstimate(trimmedName, trimmedQty);
    }
    price = Number(price.toFixed(2));

    res.json({
      estimatedCost: price,
      currency: 'USD',
      priceSource: 'ai',
    });
  } catch (err: any) {
    console.error('[Server] Gemini price estimation error:', err?.message || err);
    const fallback = getFallbackEstimate(trimmedName, trimmedQty);
    res.json({
      estimatedCost: fallback,
      currency: 'USD',
      priceSource: 'ai',
      fallback: true,
    });
  }
});

// 9. Batch Grocery Items Price Estimation via Gemini AI
app.post('/api/grocery/estimate-prices', async (req, res) => {
  const { items, knownPrices } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.json({ estimates: {}, currency: 'USD', priceSource: 'ai' });
    return;
  }

  const estimates: Record<string, number> = {};
  const itemsNeedingEstimate: any[] = [];

  // Check historical/receipt prices first
  items.forEach((it: any) => {
    if (!it || !it.id || !it.name) return;
    const lower = it.name.toLowerCase().trim();
    if (knownPrices && typeof knownPrices === 'object' && knownPrices[lower] !== undefined) {
      const hist = Number(knownPrices[lower]);
      if (!isNaN(hist) && hist > 0) {
        estimates[it.id] = Number(hist.toFixed(2));
        return;
      }
    }
    itemsNeedingEstimate.push(it);
  });

  if (itemsNeedingEstimate.length === 0) {
    res.json({ estimates, currency: 'USD', priceSource: 'receipt' });
    return;
  }

  const ai = getGenAI();

  if (!ai) {
    itemsNeedingEstimate.forEach((it: { id: string; name: string; quantity?: string }) => {
      if (it.id && it.name) {
        estimates[it.id] = getFallbackEstimate(it.name, it.quantity);
      }
    });
    res.json({ estimates, currency: 'USD', priceSource: 'ai', fallback: true });
    return;
  }

  try {
    const prompt = `Estimate the typical current US grocery store price in USD for each of the following grocery items.
Items:
${itemsNeedingEstimate.map((it: any, idx: number) => `${idx + 1}. [ID: ${it.id}] ${it.quantity ? `${it.quantity} of ` : ''}${it.name}`).join('\n')}

Reply with a JSON array where each item has "id" (the exact string ID provided) and "price" (number in USD, e.g. 3.49). If unsure, give a reasonable average.
Reply with ONLY the valid JSON array.`;

    const response = await callGeminiWithFallback(
      ai,
      async (modelName) => {
        return await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
      }
    );

    const text = response.text?.trim() || '[]';
    let parsed: Array<{ id: string; price: number }> = [];
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    }

    if (Array.isArray(parsed)) {
      parsed.forEach((entry) => {
        if (entry.id && typeof entry.price === 'number' && entry.price > 0) {
          estimates[entry.id] = Number(entry.price.toFixed(2));
        }
      });
    }

    // Fill any missing with fallback
    itemsNeedingEstimate.forEach((it: any) => {
      if (it.id && estimates[it.id] === undefined) {
        estimates[it.id] = getFallbackEstimate(it.name, it.quantity);
      }
    });

    res.json({ estimates, currency: 'USD', priceSource: 'ai' });
  } catch (err: any) {
    console.error('[Server] Gemini batch price estimation error:', err?.message || err);
    itemsNeedingEstimate.forEach((it: any) => {
      if (it.id && estimates[it.id] === undefined) {
        estimates[it.id] = getFallbackEstimate(it.name, it.quantity);
      }
    });
    res.json({ estimates, currency: 'USD', priceSource: 'ai', fallback: true });
  }
});

// 10. AI Receipt Image Parser via Multimodal Gemini Vision
app.post('/api/grocery/parse-receipt', async (req, res) => {
  const { image, mimeType } = req.body;
  if (!image || typeof image !== 'string') {
    res.status(400).json({ error: 'Receipt image data is required.' });
    return;
  }

  let base64Data = image;
  let detectedMime = mimeType || 'image/jpeg';

  const dataUriMatch = image.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    detectedMime = dataUriMatch[1];
    base64Data = dataUriMatch[2];
  }

  const ai = getGenAI();

  if (!ai) {
    // Provide a realistic fallback sample parse if API key is not configured
    const sampleItems = [
      { name: 'Organic Whole Milk', price: 4.29, quantity: '1 gal', category: 'dairy_eggs', notes: 'Store brand' },
      { name: 'Grade A Large Eggs', price: 3.49, quantity: '1 dozen', category: 'dairy_eggs', notes: 'Cage free' },
      { name: 'Gala Apples', price: 2.99, quantity: '2 lbs', category: 'produce', notes: 'Fresh' },
      { name: 'Whole Wheat Bread', price: 3.19, quantity: '1 loaf', category: 'bakery', notes: 'Sliced' },
      { name: 'Boneless Chicken Breasts', price: 7.89, quantity: '1.5 lbs', category: 'meat_seafood', notes: 'Fresh pack' },
      { name: 'Ground Cinnamon', price: 2.49, quantity: '1 jar', category: 'pantry', notes: 'Spice' },
    ];
    const total = sampleItems.reduce((acc, it) => acc + it.price, 0);

    res.json({
      success: true,
      storeName: 'Sample Grocery Store',
      receiptDate: new Date().toISOString().split('T')[0],
      currency: 'USD',
      subtotal: total,
      tax: Number((total * 0.05).toFixed(2)),
      total: Number((total * 1.05).toFixed(2)),
      items: sampleItems,
      fallback: true,
    });
    return;
  }

  try {
    const prompt = `You are an expert receipt OCR scanner and grocery analyst for a family kitchen pantry and grocery budgeting app.
Analyze this store receipt photo and extract all purchased products, item costs, quantities, and receipt details.

Return a valid JSON object with the following fields:
{
  "storeName": "Name of the store (e.g. 'Trader Joe's', 'Walmart', 'Kroger', 'Costco', 'Aldi', 'Target', 'Safeway', or null if unreadable)",
  "receiptDate": "Date of purchase in YYYY-MM-DD format (or null)",
  "currency": "USD",
  "subtotal": float or null,
  "tax": float or 0,
  "total": float or null,
  "items": [
    {
      "name": "Clean product name without cryptic abbreviations or POS codes (e.g. expand 'ORG WHL MLK 1GL' to 'Organic Whole Milk', 'BNLS SKNLS CHKN BRST' to 'Boneless Skinless Chicken Breast', 'BANANAS' to 'Bananas')",
      "price": float (actual unit price or net line total charged in USD, e.g. 3.49),
      "quantity": "package size, weight, or count like '1 gal', '2 lbs', '1 dozen', '1 loaf', '1' (default '1' if unspecified)",
      "category": "produce | dairy_eggs | meat_seafood | bakery | pantry | frozen | snacks | beverages | household | other",
      "notes": "Any discount notes or brand details if detected, else empty string"
    }
  ]
}

Important Rules:
1. Clean up shortened abbreviations into friendly names kids and parents understand.
2. Ensure 'price' is a positive floating-point number. If an item has an immediate store discount or loyalty markdown, use the net final charged price.
3. Every item must be classified into one of the exact category strings: produce, dairy_eggs, meat_seafood, bakery, pantry, frozen, snacks, beverages, household, other.
4. Filter out administrative non-grocery lines like tax, total, payment method (VISA, Debit, Cash), change due, or bottle deposit fee lines from the items list.
5. If the receipt has multiple items, extract every single purchased item line.
6. Reply ONLY with the valid JSON object.`;

    const response = await callGeminiWithFallback(
      ai,
      async (modelName) => {
        return await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: detectedMime,
                },
              },
              {
                text: prompt,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });
      }
    );

    const text = response.text?.trim() || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    }

    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    const validCategories = new Set([
      'produce',
      'dairy_eggs',
      'meat_seafood',
      'bakery',
      'pantry',
      'frozen',
      'snacks',
      'beverages',
      'household',
      'other',
    ]);

    const sanitizedItems = rawItems
      .filter((it: any) => it && typeof it.name === 'string' && it.name.trim().length > 0)
      .map((it: any) => {
        let price = typeof it.price === 'number' ? it.price : parseFloat(String(it.price || '0').replace(/[^0-9.]/g, ''));
        if (isNaN(price) || price <= 0) price = 2.99;
        price = Number(price.toFixed(2));

        let cat = typeof it.category === 'string' ? it.category.toLowerCase().trim() : 'pantry';
        if (!validCategories.has(cat)) {
          cat = 'pantry';
        }

        return {
          name: it.name.trim(),
          price,
          quantity: it.quantity && typeof it.quantity === 'string' ? it.quantity.trim() : '1',
          category: cat,
          notes: it.notes && typeof it.notes === 'string' ? it.notes.trim() : '',
        };
      });

    const calculatedSubtotal = sanitizedItems.reduce((acc: number, it: any) => acc + it.price, 0);
    const subtotal = typeof parsed.subtotal === 'number' ? parsed.subtotal : Number(calculatedSubtotal.toFixed(2));
    const tax = typeof parsed.tax === 'number' ? parsed.tax : 0;
    const total = typeof parsed.total === 'number' && parsed.total > 0 ? parsed.total : Number((subtotal + tax).toFixed(2));

    res.json({
      success: true,
      storeName: parsed.storeName || null,
      receiptDate: parsed.receiptDate || new Date().toISOString().split('T')[0],
      currency: parsed.currency || 'USD',
      subtotal,
      tax,
      total,
      items: sanitizedItems,
    });
  } catch (err: any) {
    console.error('[Server] Gemini receipt parse error:', err?.message || err);
    const errText = String(err?.message || err);
    const isHighDemand =
      errText.includes('503') ||
      errText.includes('high demand') ||
      errText.includes('UNAVAILABLE') ||
      errText.includes('429');

    res.status(isHighDemand ? 503 : 500).json({
      error: isHighDemand
        ? 'The AI receipt scanner is experiencing high demand right now. Please tap Retry Scan in a moment.'
        : 'Failed to extract receipt items. Please ensure the image is clear or try again.',
      details: errText,
      canRetry: true,
    });
  }
});

// --- Server Lifecycle & Vite Middleware ---

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ChoreQuest Server] Sync Engine running at http://0.0.0.0:${PORT}`);
  });
}

start();
