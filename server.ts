import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { FamilyDatabase } from './src/types';
import { DEFAULT_SEED_DATA } from './src/utils/storage';
import { POPULAR_RETAIL_DATABASE, lookupRetailProductLocal } from './src/lib/retailCatalog';

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

// In-memory active database and revision tracking
let currentDatabaseRev = Date.now();
let currentDatabaseUpdatedAt = Date.now();
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
        currentDatabaseRev = (parsed as any)._rev || Date.now();
        currentDatabaseUpdatedAt = (parsed as any)._updatedAt || Date.now();
        (parsed as any)._rev = currentDatabaseRev;
        (parsed as any)._updatedAt = currentDatabaseUpdatedAt;
        currentDatabase = parsed;
        console.log('[Server] Loaded persisted database from disk with rev:', currentDatabaseRev);
      }
    } else {
      (currentDatabase as any)._rev = currentDatabaseRev;
      (currentDatabase as any)._updatedAt = currentDatabaseUpdatedAt;
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
  currentDatabaseRev++;
  currentDatabaseUpdatedAt = Date.now();
  (updatedDb as any)._rev = currentDatabaseRev;
  (updatedDb as any)._updatedAt = currentDatabaseUpdatedAt;
  currentDatabase = updatedDb;
  persistDatabaseToDisk();

  const payload = JSON.stringify({
    type: 'DATABASE_UPDATED',
    database: currentDatabase,
    rev: currentDatabaseRev,
    updatedAt: currentDatabaseUpdatedAt,
    senderId: senderId || null,
    timestamp: currentDatabaseUpdatedAt,
  });

  const deadClientIds: string[] = [];
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
      if (typeof (client.res as any).flush === 'function') {
        (client.res as any).flush();
      }
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
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    connectedClients: sseClients.length,
    rev: currentDatabaseRev,
    updatedAt: currentDatabaseUpdatedAt,
  });
});

// 2. Fetch current shared database
app.get('/api/database', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(currentDatabase);
});

// 2b. Ultra-lightweight database version check endpoint for sub-second lag detection
app.get('/api/database/version', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json({
    rev: currentDatabaseRev,
    updatedAt: currentDatabaseUpdatedAt,
    kidsCount: currentDatabase.kids?.length || 0,
    choresCount: currentDatabase.chores?.length || 0,
    logsCount: currentDatabase.logs?.length || 0,
  });
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
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });
  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const client: SSEClient = { id: clientId, res };
  sseClients.push(client);

  // Send initial state upon connection
  res.write(
    `data: ${JSON.stringify({
      type: 'CONNECTED',
      clientId,
      database: currentDatabase,
      rev: currentDatabaseRev,
      updatedAt: currentDatabaseUpdatedAt,
      timestamp: Date.now(),
    })}\n\n`
  );
  if (typeof (res as any).flush === 'function') {
    (res as any).flush();
  }

  // Keep-alive heartbeat every 10 seconds to keep connection open and detect dead sockets
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
    } catch {
      clearInterval(heartbeat);
    }
  }, 10000);

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

// --- Kid-Coin Financial Engine & Verified Wishlist Catalog ---

export const VERIFIED_ITEMS = [
  {
    id: 'ps5-slim',
    name: 'PlayStation 5 Slim Console',
    category: 'Gaming',
    currentCost: 499.99,
    retailer: 'Official Retailers (Sony / Best Buy)',
    verifiedDate: '2025-Q1 MSRP Checked',
    icon: 'Gamepad2',
    description: 'Ultra-high speed SSD, ray tracing, 4K gaming, DualSense wireless controller included.',
  },
  {
    id: 'switch-oled',
    name: 'Nintendo Switch - OLED Model',
    category: 'Gaming',
    currentCost: 349.99,
    retailer: 'Nintendo Store / Target',
    verifiedDate: '2025 MSRP Checked',
    icon: 'Tv',
    description: '7-inch vibrant OLED screen, wide adjustable stand, enhanced audio, portable handheld.',
  },
  {
    id: 'lego-millennium-falcon',
    name: 'LEGO Star Wars Millennium Falcon',
    category: 'Toys & LEGO',
    currentCost: 169.99,
    retailer: 'LEGO Shop / Amazon',
    verifiedDate: '2025 MSRP Checked',
    icon: 'Boxes',
    description: '1,351 pieces, opening cockpit, rotating gun turrets, 7 Star Wars minifigures.',
  },
  {
    id: 'airpods-4',
    name: 'Apple AirPods 4',
    category: 'Audio',
    currentCost: 129.00,
    retailer: 'Apple Store',
    verifiedDate: '2025 MSRP Checked',
    icon: 'Headphones',
    description: 'Personalized Spatial Audio with dynamic head tracking, USB-C charging case.',
  },
  {
    id: 'electric-scooter',
    name: 'Segway Ninebot eKickScooter for Kids',
    category: 'Outdoors',
    currentCost: 229.99,
    retailer: 'Segway Official',
    verifiedDate: '2025 MSRP Checked',
    icon: 'Bike',
    description: 'Safe speed limiters (10 mph max), ambient underglow lights, dual braking system.',
  },
  {
    id: 'ipad-10th-gen',
    name: 'Apple iPad 10th Gen (64GB)',
    category: 'Electronics',
    currentCost: 349.00,
    retailer: 'Apple / Authorized Resellers',
    verifiedDate: '2025 MSRP Checked',
    icon: 'Tablet',
    description: '10.9-inch Liquid Retina display, A14 Bionic chip, Apple Pencil support for drawing & games.',
  },
  {
    id: 'roblox-10k',
    name: '10,000 Robux Digital Gift Card',
    category: 'Digital / Gaming',
    currentCost: 99.99,
    retailer: 'Roblox Official Store',
    verifiedDate: '2025 MSRP Checked',
    icon: 'Coins',
    description: 'Virtual currency to customize your in-game avatar and unlock exclusive special items.',
  },
  {
    id: 'bmx-bike',
    name: 'Mongoose Legion Freestyle 20" BMX',
    category: 'Sports',
    currentCost: 189.99,
    retailer: 'Bicycle Specialists',
    verifiedDate: '2025 MSRP Checked',
    icon: 'Sparkles',
    description: 'Hi-Ten steel frame, 2.3-inch tires, 25x9T gearing, aluminum U-brake for park riding.',
  },
];

// 11. Kid-Coin Verified items catalog
app.get('/api/verified-items', (req, res) => {
  res.json({
    items: VERIFIED_ITEMS,
    updatedAt: new Date().toISOString(),
  });
});

// 12. Personalized financial tips and milestone coaching via Gemini
app.post('/api/tips', async (req, res) => {
  try {
    const {
      kidName = 'Navigator',
      age = 10,
      goalName = 'Dream Reward',
      targetCost = 100,
      currentSaved = 25,
      weeklyAllowance = 5,
      recentChores = [],
    } = req.body;

    const remaining = Math.max(0, targetCost - currentSaved);
    const progressPercent = Math.min(100, Math.round((currentSaved / Math.max(1, targetCost)) * 100));
    const effectiveWeeklyRate = Math.max(2, weeklyAllowance + 3); // allowance + typical chore earnings
    const weeksRemaining = Math.ceil(remaining / effectiveWeeklyRate);

    const ai = getGenAI();

    if (ai) {
      try {
        const prompt = `You are "Captain Penny", an enthusiastic, encouraging astronaut savings mentor helping a kid named ${kidName} (age ${age}) save for their dream goal: "${goalName}" costing $${targetCost.toFixed(2)}.
Current financial telemetry:
- Current Savings: $${currentSaved.toFixed(2)} (${progressPercent}% achieved)
- Remaining to save: $${remaining.toFixed(2)}
- Weekly Allowance / Chore Pace: ~$${effectiveWeeklyRate.toFixed(2)}/week
- Estimated time to liftoff: ~${weeksRemaining} weeks
- Recent chore accomplishments: ${recentChores.length > 0 ? recentChores.join(', ') : 'Daily chore quest routines'}

Provide financial advice tailored for a child in strict JSON format:
{
  "headline": "A short 1-sentence punchy motivational cosmic status update with an emoji",
  "milestoneTip": "A 1-2 sentence tip about their next milestone (25% Troposphere, 50% Low Orbit, 75% Deep Space, or 100% Planetary Touchdown)",
  "fastTrackIdeas": [
    "Specific actionable chore/savings action 1",
    "Specific actionable chore/savings action 2",
    "Specific actionable chore/savings action 3"
  ],
  "spendingTradeoff": "A relatable kid comparison showing how holding off on a snack or impulse buy gets them closer to ${goalName}",
  "estimatedPace": "An encouraging summary of their countdown timeline"
}`;

        const response = await callGeminiWithFallback(ai, async (modelName) => {
          return await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          res.json({
            advice: parsed,
            metrics: { remaining, progressPercent, weeksRemaining },
          });
          return;
        }
      } catch (geminiErr) {
        console.warn('[Server] Gemini tips fallback triggered:', geminiErr);
      }
    }

    // Heuristic algorithmic fallback advice if offline or Gemini unavailable
    let milestoneStage = 'Launchpad Prep (0%)';
    let nextMilestoneDesc = `Reach $${(targetCost * 0.25).toFixed(2)} (25%) to blast through the atmospheric boundary!`;
    if (progressPercent >= 75) {
      milestoneStage = 'Deep Space Coasting (75%)';
      nextMilestoneDesc = `Final burn! You only need $${remaining.toFixed(2)} more for 100% touchdown on ${goalName}!`;
    } else if (progressPercent >= 50) {
      milestoneStage = 'Low Orbit Satellites (50%)';
      nextMilestoneDesc = `Halfway across the cosmos! Push for $${(targetCost * 0.75).toFixed(2)} (75%) to escape gravity!`;
    } else if (progressPercent >= 25) {
      milestoneStage = 'Troposphere Ascent (25%)';
      nextMilestoneDesc = `Next checkpoint: 50% ($${(targetCost * 0.5).toFixed(2)}) for orbit stabilization!`;
    }

    res.json({
      advice: {
        headline: progressPercent >= 100
          ? `Mission accomplished, ${kidName}! Your ${goalName} rocket is cleared for landing! 🎉`
          : `Thrusters firing, ${kidName}! You are ${progressPercent}% of the way to ${goalName}! 🚀`,
        milestoneTip: nextMilestoneDesc,
        fastTrackIdeas: [
          'Claim an extra bounty mission on the Chore Board this weekend for bonus coins.',
          'Save 100% of your weekly allowance into your rocket vault.',
          'Ask mom & dad if there is a special seasonal project (raking, washing car, organizing) for a savings booster.',
        ],
        spendingTradeoff: `Skipping one $3.50 treat or snack purchase keeps your savings intact and shaves half a week off your wait!`,
        estimatedPace: weeksRemaining <= 1
          ? `You're in the final countdown! Just days away from liftoff!`
          : `At your steady pace, you are on track to touch down in ~${weeksRemaining} weeks!`,
      },
      metrics: { remaining, progressPercent, weeksRemaining },
    });
  } catch (err: any) {
    console.error('[Server] Tips endpoint error:', err);
    res.status(500).json({ error: 'Failed to generate savings coach tips.' });
  }
});

// 12. Retail Database Samples for popular stores (Amazon, Best Buy, Target, Walmart, Micro Center, Apple, LEGO)
app.get('/api/retail-samples', (req, res) => {
  res.json({
    success: true,
    stores: ['Amazon', 'Best Buy', 'Target', 'Walmart', 'Micro Center', 'Apple', 'LEGO', 'GameStop'],
    samples: POPULAR_RETAIL_DATABASE,
  });
});

// 13. AI Retail Database & Barcode/SKU/Item# Lookup Endpoint
app.post('/api/retail-lookup', async (req, res) => {
  try {
    const { query = '', retailer = 'all', codeType = 'auto' } = req.body;
    const cleanQuery = String(query).trim();

    if (!cleanQuery) {
      res.status(400).json({ success: false, message: 'Query is required.' });
      return;
    }

    // First check local verified database for instant exact matches
    const localMatch = lookupRetailProductLocal(cleanQuery, retailer);

    // Call Gemini AI model if available to identify product and retail database records
    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `You are a precision retail product identification expert and AI product database engine for a kid savings app.
Look up this product identifier from popular retailers (including Amazon, Best Buy, Target, Walmart, Micro Center, Apple, LEGO, GameStop):
Query/Code: "${cleanQuery}"
Specific Retailer Filter: "${retailer && retailer !== 'all' ? retailer : 'Any / Auto-detect'}"
Code Type Hint: "${codeType || 'auto (could be SKU, Barcode/UPC, Item#, ASIN, DPCI, or Model#)'}"

Instructions:
1. Identify the exact real-world commercial product that corresponds to this SKU, barcode/UPC, Item#, or query.
   - Amazon format: ASIN (e.g. B0CL5KNB9M or B07NDXZV2B), Model #, or 12-digit UPC
   - Best Buy format: 7-digit SKU (e.g. 6522854, 6470924), Model #, or UPC
   - Target format: 9-digit DPCI (e.g. 207-00-0199 or 057-00-0089) or TCIN or UPC
   - Walmart format: 8-9 digit Item ID (e.g. 345678912, 554321908) or UPC
   - Micro Center format: 6-digit SKU (e.g. 654321, 589214, 621980) or Mfr Part #
2. Determine which major retailer it belongs to (e.g., Best Buy, Target, Amazon, Walmart, Micro Center, Apple, LEGO).
3. Determine accurate current MSRP / retail selling price in USD.
4. Return a JSON object with:
   - "title": string (official clean product name)
   - "targetCost": number (e.g. 499.99)
   - "retailer": string (e.g. "Best Buy", "Target", "Amazon", "Walmart", "Micro Center", "Apple", "LEGO")
   - "category": string (one of "Gaming", "Electronics", "Toys & LEGO", "Tech & PC", "Audio", "Sports & Outdoors", "Fashion & Clothes")
   - "sku": string (the SKU, DPCI, or store code for that retailer)
   - "barcode": string (12-digit UPC or 13-digit EAN barcode)
   - "itemNumber": string (store item #, ASIN, or DPCI)
   - "modelNumber": string (manufacturer model number)
   - "icon": string (one of "Gamepad2", "Tv", "Boxes", "Headphones", "Bike", "Tablet", "Coins", "Laptop", "Sparkles")
   - "description": string (concise 1-2 sentence kid-friendly description)
   - "specs": array of 3 concise strings highlighting key features
   - "whyKidsLoveIt": string (fun sentence explaining why kids want to save for it)
   - "confidence": "verified" | "high" | "estimated"

Return STRICTLY valid JSON.`;

        const response = await callGeminiWithFallback(ai, async (modelName) => {
          return await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });
        });

        const text = response.text?.trim();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed.title && parsed.targetCost) {
              const cost = typeof parsed.targetCost === 'number' ? parsed.targetCost : parseFloat(parsed.targetCost);
              res.json({
                success: true,
                source: 'gemini-ai',
                product: {
                  ...parsed,
                  targetCost: Number((isNaN(cost) ? 29.99 : cost).toFixed(2)),
                  id: `goal-ai-${Date.now()}`,
                },
              });
              return;
            }
          } catch {
            // fallback to local database below
          }
        }
      } catch (aiErr: any) {
        console.warn('[Server] Gemini retail lookup error, falling back to local database:', aiErr?.message || aiErr);
      }
    }

    // If local match found, return it
    if (localMatch) {
      res.json({
        success: true,
        source: 'local-database',
        product: {
          ...localMatch,
          title: localMatch.name,
          targetCost: localMatch.currentCost,
          confidence: 'verified',
        },
      });
      return;
    }

    res.status(404).json({
      success: false,
      message: `Could not identify product for "${cleanQuery}". Try entering a known SKU (e.g. Best Buy 6522854, Target 207-00-0199), barcode (e.g. 711719570530), or use one of the quick test presets!`,
    });
  } catch (error: any) {
    console.error('[Server] Retail lookup error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to lookup retail product',
    });
  }
});

// 14. Cross-App ChoreQuest & KidCoin Sync Endpoint (KidCoin Vault Protocol v1)
app.post('/api/chorequest/sync', async (req, res) => {
  try {
    const { endpoint = 'http://localhost:5000', action = 'pull', database } = req.body;
    const cleanEndpoint = String(endpoint).replace(/\/+$/, '');

    if (action === 'push') {
      if (!database) {
        res.status(400).json({ success: false, message: 'Missing database payload to push.' });
        return;
      }
      const response = await fetch(`${cleanEndpoint}/api/database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ database, senderId: 'chorequest-app' }),
      });
      if (!response.ok) {
        res.status(response.status).json({
          success: false,
          message: `Remote KidCoin node returned HTTP ${response.status}`,
        });
        return;
      }
      res.json({ success: true, message: 'Database pushed to KidCoin node successfully.' });
      return;
    }

    // Pull from remote node
    const response = await fetch(`${cleanEndpoint}/api/database`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        message: `Remote KidCoin node returned HTTP ${response.status}`,
      });
      return;
    }

    const data: any = await response.json();
    const fetchedDb = data.database || data;

    if (fetchedDb && fetchedDb.kids && fetchedDb.chores) {
      currentDatabase = fetchedDb;
      currentDatabaseRev = Date.now();
      currentDatabaseUpdatedAt = Date.now();
      persistDatabaseToDisk();
      broadcastDatabaseUpdate(currentDatabase, 'remote-kidcoin-pull');
      res.json({ success: true, database: currentDatabase });
      return;
    }

    res.status(422).json({ success: false, message: 'Invalid database payload from remote node.' });
  } catch (err: any) {
    console.error('[Server] Cross-app sync error:', err);
    res.status(500).json({ success: false, message: err?.message || 'Cross-app sync failed.' });
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
