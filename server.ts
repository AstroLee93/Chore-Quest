import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { FamilyDatabase, GradeLevel } from './src/types';
import { DEFAULT_SEED_DATA } from './src/utils/storage';
import { BrainTeaser, BRAIN_TEASERS_CATALOG } from './src/utils/brainTeasersData';

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

// Quota & circuit-breaker state for AI services to prevent repeated 429 quota exhaustion
let geminiQuotaCooldownUntil = 0;

function isGeminiQuotaExhausted(): boolean {
  return Date.now() < geminiQuotaCooldownUntil;
}

function triggerGeminiQuotaCooldown(delaySeconds = 60) {
  geminiQuotaCooldownUntil = Date.now() + (delaySeconds * 1000);
  console.info(`[Server] Gemini quota rate limit hit. Entering ${delaySeconds}s circuit breaker cooldown.`);
}

// Resilient Gemini model caller with exponential retry and model fallback cascade
async function callGeminiWithFallback<T>(
  ai: GoogleGenAI,
  callFn: (modelName: string) => Promise<T>,
  preferredModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest']
): Promise<T> {
  if (isGeminiQuotaExhausted()) {
    const remainingSecs = Math.ceil((geminiQuotaCooldownUntil - Date.now()) / 1000);
    const quotaErr = new Error(`Gemini quota cooldown active (${remainingSecs}s remaining); using offline fallback.`);
    (quotaErr as any).isQuota = true;
    throw quotaErr;
  }

  let lastError: any = null;

  for (let mIdx = 0; mIdx < preferredModels.length; mIdx++) {
    const model = preferredModels[mIdx];
    const isLastModel = mIdx === preferredModels.length - 1;
    const maxAttempts = isLastModel ? 2 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await callFn(model);
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err || '');
        const isQuota =
          errStr.includes('429') ||
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('quota') ||
          errStr.includes('Quota');

        if (isQuota) {
          triggerGeminiQuotaCooldown(60);
        }

        const isTemporary =
          isQuota ||
          errStr.includes('503') ||
          errStr.includes('UNAVAILABLE') ||
          errStr.includes('high demand') ||
          errStr.includes('overloaded');

        // If another model is available in the cascade, seamlessly transition without retrying the congested model
        if (isTemporary && !isLastModel) {
          console.info(`[Server] Model ${model} unavailable (${isQuota ? 'quota limit' : 'congested'}); transitioning to ${preferredModels[mIdx + 1]}...`);
          break;
        }

        // Quota exhaustion cannot be solved with an 800ms retry; break immediately to use offline/catalog fallback
        if (isQuota) {
          break;
        }

        if (isTemporary && attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }

        console.info(`[Server] Model ${model} query completed with fallback`);
        break;
      }
    }
  }

  throw lastError;
}

app.use(compression());
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
        if (!parsed.settings.leaderRole) {
          parsed.settings.leaderRole = DEFAULT_SEED_DATA.settings.leaderRole;
        }
        if (!parsed.settings.birthdayConfig) {
          parsed.settings.birthdayConfig = DEFAULT_SEED_DATA.settings.birthdayConfig;
        }
        if (parsed.kids && parsed.kids.length > 0) {
          const currentLeaderId = parsed.settings?.leaderRole?.leaderKidId;
          const seedMap = new Map((DEFAULT_SEED_DATA.kids || []).map((sk: any) => [sk.id, sk]));
          parsed.kids = parsed.kids.map((k: any) => {
            const seedKid = seedMap.get(k.id) as any;
            return {
              ...k,
              birthdate: k.birthdate !== undefined ? k.birthdate : seedKid?.birthdate,
              birthdayWish: k.birthdayWish !== undefined ? k.birthdayWish : seedKid?.birthdayWish,
              isLeader: k.isLeader !== undefined ? k.isLeader : (currentLeaderId ? k.id === currentLeaderId : false),
            };
          });
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
      fs.writeFileSync(DB_FILE, JSON.stringify(currentDatabase), 'utf-8');
      console.log('[Server] Initialized new database file with seed data.');
    }
  } catch (err) {
    console.error('[Server] Failed to load database from disk, using default seed:', err);
  }
}

initDatabase();

// Non-blocking, atomic, debounced disk persistence
let diskWriteTimer: NodeJS.Timeout | null = null;
let isWritingDisk = false;
let pendingDiskWrite = false;

function persistDatabaseToDisk() {
  if (diskWriteTimer) clearTimeout(diskWriteTimer);
  diskWriteTimer = setTimeout(async () => {
    diskWriteTimer = null;
    if (isWritingDisk) {
      pendingDiskWrite = true;
      return;
    }
    isWritingDisk = true;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        await fs.promises.mkdir(DATA_DIR, { recursive: true });
      }
      const dataStr = JSON.stringify(currentDatabase);
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      await fs.promises.writeFile(tempFile, dataStr, 'utf-8');
      await fs.promises.rename(tempFile, DB_FILE);
    } catch (err) {
      console.error('[Server] Failed to write database to disk:', err);
    } finally {
      isWritingDisk = false;
      if (pendingDiskWrite) {
        pendingDiskWrite = false;
        persistDatabaseToDisk();
      }
    }
  }, 80);
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

    if (ai && !isGeminiQuotaExhausted()) {
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
        }, ['gemini-3.1-flash-lite', 'gemini-flash-latest']);

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
        console.info('[Server] Gemini tips fallback activated.');
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

// 12b. Dynamic AI Brain Teaser Generator via Gemini (Curriculum & Learning Focused)
const GRADE_CURRICULUM_GUIDELINES: Record<string, string> = {
  kindergarten: `Grade Level: Kindergarten & Pre-K (Ages 4-6)
- Core Learning Topics: Counting 1-10 objects, basic addition (+1, +2) with fun items (apples, stars, puppies), shapes (circle, square, triangle, rectangle), primary & secondary colors, rhyming words (cat/hat, fox/box), baby animal names (cow/calf, dog/puppy, cat/kitten), simple nature facts, opposites (hot/cold, big/little).
- Language: Very simple vocabulary, cheerful, short and sweet sentences.
- Options: 4 very short choices (1-3 words each).`,
  '1st_grade': `Grade Level: 1st Grade (Ages 6-7)
- Core Learning Topics: Addition & subtraction to 20, telling time to the hour & half-hour, counting by 2s/5s/10s, animal habitats and survival needs, plant parts (roots, stem, leaves), seasons and weather, phonics and compound words, simple logic sequences.
- Language: Early elementary vocabulary, encouraging tone.
- Options: 4 straightforward choices (1-4 words each).`,
  '2nd_grade': `Grade Level: 2nd Grade (Ages 7-8)
- Core Learning Topics: Two-digit addition/subtraction, US money and counting coins (quarters, dimes, nickels, pennies), place value (hundreds/tens/ones), states of matter (solid, liquid, gas), life cycles (frog, butterfly, plant), map symbols and cardinal directions (N/S/E/W), spelling patterns, time intervals.
- Language: Friendly, accessible elementary reading level.`,
  '3rd_grade': `Grade Level: 3rd Grade (Ages 8-9)
- Core Learning Topics: Introduction to multiplication and division, basic unit fractions (1/2, 1/3, 1/4), planets of our solar system, food chains and ecosystems, weather vs. climate, mystery vocabulary, idioms, cause & effect relationships, measurement (inches, feet, pounds).
- Language: Inquisitive, discovery-oriented, building critical thinking skills.`,
  '4th_grade': `Grade Level: 4th Grade (Ages 9-10)
- Core Learning Topics: Multi-digit multiplication, division with remainders, geometric angles (acute, right, obtuse) and line types, US regions and geography, forms of energy (sound, light, electrical, thermal), rock cycle and fossils, sensory animal adaptations, analogies, idioms, multi-step math logic.
- Language: Adventurous, smart, engaging.`,
  '5th_grade': `Grade Level: 5th Grade (Ages 10-11)
- Core Learning Topics: Decimals and percentages, multiplying fractions, volume (length x width x height) and perimeter, human organ systems (circulatory, respiratory, nervous), Earth's spheres (atmosphere, geosphere, hydrosphere, biosphere), planetary orbits, vocabulary analogies, clever deduction logic.
- Language: Sharp, curious, rewarding deeper reasoning.`,
  middle_school: `Grade Level: Middle School / 6th–8th Grade (Ages 11-14)
- Core Learning Topics: Pre-algebra, ratios & proportions, negative numbers, cells, genes & DNA, periodic table elements and basic chemical reactions, Newton's laws of motion, world history & civilizations, literary devices, cipher codes, deductive logic puzzles.
- Language: Mature, intriguing, real-world relevant without dry jargon.`,
  high_school: `Grade Level: High School / 9th–12th Grade (Ages 14-18)
- Core Learning Topics: Algebra, geometry, physics (kinematics, gravity, energy conservation), chemistry (atomic structure, solutions), biology (cellular respiration, ecology), world literature & historical trivia, cognitive biases & logical fallacies, advanced math/lateral brain teasers.
- Language: High-school intellectual curiosity, witty, thought-provoking.`,
};

// Rich subtopic matrix to guarantee high variety and rotate students through fresh learning concepts
const CURRICULUM_TOPIC_MATRIX: Record<string, string[]> = {
  kindergarten: [
    'Counting everyday playful objects (1 to 10)',
    'Basic addition (+1, +2) with toys and animals',
    'Geometric shapes in daily life (circles, triangles, squares, rectangles)',
    'Primary and secondary colors mixing (yellow + blue = green)',
    'Rhyming word pairs (cat/hat, star/car, frog/log)',
    'Baby animal names (bear cub, horse foal, duck duckling)',
    'Opposites and spatial reasoning (tall/short, heavy/light, above/below)',
    'Five human senses (seeing with eyes, tasting sweet things)',
    'Weather and seasons (what clothes for snowy or rainy days)',
    'Day versus night animals (owls and bats awake at night)',
    'Ocean creature wonders (clownfish, sea stars, dolphins)',
    'Farm life and helpers (chickens, bees making honey)',
    'Healthy food and fruits (apples growing on trees, carrots in dirt)',
    'Sound patterns and instruments (drums, bells, triangles)',
    'Water states in play (ice melting into water, steam from soup)',
  ],
  '1st_grade': [
    'Addition & subtraction combinations within 20',
    'Telling time on an analog clock (hours and half-hours)',
    'Skip counting by 2s, 5s, and 10s',
    'Plant biology (what roots, stems, leaves, and flowers do)',
    'Animal habitats (desert vs ocean vs arctic vs rainforest)',
    'Phonics, compound words, and word puzzles (sun + flower = sunflower)',
    'Simple coin values (pennies, nickels, dimes)',
    'Seasons, weather cycles, and cloud types',
    'Light and shadow exploration (how shadows change size)',
    'Animal adaptations (bird beaks, camel humps, camouflage)',
    'Magnets and magnetic materials (iron vs plastic vs wood)',
    'Life cycles of frogs and butterflies (caterpillar to chrysalis)',
    'Basic patterns and shape attributes (sides and vertices)',
    'States of matter (solid rock, liquid milk, gas inside balloons)',
    'Deductive riddle clues about everyday tools and objects',
  ],
  '2nd_grade': [
    'Two-digit mental math and regrouping strategies',
    'US currency math: counting combinations of quarters, dimes, nickels, pennies',
    'Place value reasoning (hundreds, tens, ones)',
    'Measurement units: comparing inches, feet, yards, centimeters, meters',
    'States of matter and phase changes (evaporation, condensation, freezing)',
    'Pollinators and plant reproduction (bees, pollen, seed dispersal)',
    'Cardinals directions (North, South, East, West) and map symbols',
    'Fossils, dinosaurs, and Earth layers',
    'Simple machines: ramps, wheels, levers, and pulleys',
    'Properties of materials (hardness, flexibility, buoyancy in water)',
    'Homophones and spelling patterns (there/their, pair/pear, sea/see)',
    'Animal classifications (mammals with hair/milk vs birds with feathers)',
    'Water cycle steps (sun evaporates water into vapor)',
    'Even vs odd number logic and grouping',
    'Calendar math and elapsed days/weeks',
  ],
  '3rd_grade': [
    'Multiplication arrays and quick division facts',
    'Understanding unit fractions (1/2, 1/3, 1/4, 3/4) visually',
    'Planets of our Solar System and orbital facts',
    'Food chains, producers, consumers, and decomposers in nature',
    'Weather forecasting, air pressure, thermometers, and meteorology',
    'Idioms, figurative language, and curious metaphors',
    'Perimeter and area of simple rectangles',
    'Forces: static electricity, gravity, and magnetic repulsion',
    'Earth science: weathering, erosion, and volcano mechanics',
    'Human body skeleton, bones, and muscle pairs',
    'Metric conversions and liquid volume (milliliters, liters)',
    'Time intervals and elapsed time problem-solving',
    'Animal communication (whale songs, bee waggle dances, bird calls)',
    'Mystery word analogies (glove is to hand as shoe is to foot)',
    'Lateral thinking logic grid puzzles',
  ],
  '4th_grade': [
    'Multi-digit multiplication and long division remainders',
    'Geometric angle classification: acute, right, obtuse, straight',
    'Forms of energy: kinetic, potential, electrical, thermal, acoustic',
    'Geology: rock cycle (igneous, sedimentary, metamorphic) and mineral tests',
    'Sensory animal adaptations and nocturnal echolocation (bats, owls)',
    'Electricity circuits: series vs parallel, conductors vs insulators',
    'US geography, rivers, mountain ranges, and state capitals',
    'Fractions to decimals relationships (0.25 = 1/4, 0.5 = 1/2)',
    'Sound waves, pitch, frequency, and vibrations',
    'Plant photosynthesis chemistry basics (sunlight + carbon dioxide + water)',
    'Advanced word roots (Latin & Greek prefixes: tele-, auto-, micro-, bio-)',
    'Prime vs composite numbers and factor trees',
    'Renewable energy: wind, solar, hydroelectric power',
    'Optical science: reflection, refraction, and prism rainbows',
    'Multi-step math deduction problems',
  ],
  '5th_grade': [
    'Multiplying and dividing fractions with real-world scenarios',
    'Decimals operations, rounding, and percentage calculations',
    'Volume calculation (V = l x w x h) of 3D rectangular prisms',
    'The four Earth spheres: atmosphere, geosphere, hydrosphere, biosphere',
    'Human organ systems: circulatory, respiratory, nervous, and digestive',
    'Gravity, planetary masses, and moon tidal forces',
    'Ecosystem balances: invasive species and biodiversity food webs',
    'Chemical vs physical changes (rusting vs melting, baking soda & vinegar)',
    'Coordinate grid graphing in quadrant 1 (x, y coordinates)',
    'Historical inventions that transformed the world (printing press, steam engine, compass)',
    'Microscopic world: single-celled organisms, bacteria, and amoebas',
    'World ocean currents and climate effects (Gulf Stream)',
    'Logical syllogisms and deductive deduction matrix',
    'Word etymology and Latin/Greek roots in science',
    'Order of operations (PEMDAS / GEMDAS) brain teasers',
  ],
  middle_school: [
    'Pre-algebra equations, variables, and balancing scales',
    'Ratios, unit rates, and scale drawings',
    'Cellular biology: nucleus, mitochondria, cell membrane, plant cell wall',
    'Genetics basics: dominant vs recessive traits, DNA double helix',
    'Periodic table of elements: hydrogen, oxygen, carbon, iron, helium',
    'Newton’s three laws of motion with everyday physical examples',
    'World history civilizations: Mesopotamian wheels, Egyptian pyramids, Roman aqueducts',
    'Literary devices: irony, foreshadowing, alliteration, hyperbole',
    'Caesar cipher cryptography, binary numbers, and logic codes',
    'Plate tectonics, continental drift, and earthquake fault lines',
    'Speed, velocity, acceleration, and distance-time graphs',
    'Thermal energy transfer: conduction, convection, radiation',
    'Ecology: nitrogen cycle, carbon footprints, renewable resources',
    'Probability, permutations, and combinatorics teasers',
    'Advanced lateral thinking and fallacy identification',
  ],
  high_school: [
    'Algebraic reasoning and quadratic balance puzzles',
    'Geometric proofs, Pythagorean triples, and spatial trigonometry',
    'Physics: conservation of momentum, gravitational potential, kinetic energy',
    'Chemistry: covalent vs ionic bonding, atomic electron orbitals, stoichiometry',
    'Cellular respiration vs photosynthesis molecular cycles (ATP, glucose)',
    'Evolutionary mechanisms: natural selection, genetic drift, mutations',
    'Astronomy: black holes, light years, stellar nucleosynthesis, redshift',
    'World literature motifs, rhetorical appeals (ethos, pathos, logos)',
    'Cognitive biases and informal logical fallacies (ad hominem, straw man, confirmation bias)',
    'Computer science algorithms: Big O complexity concepts, sorting logic, recursion',
    'Macroeconomics and supply/demand equilibrium concepts',
    'Neuroscience: neurons, synapses, neurotransmitters (dopamine, serotonin)',
    'Complex probability conundrums (Monty Hall problem, birthday paradox)',
    'Advanced cryptography, public key encryption principles, hash functions',
    'Historical turning points and geopolitical strategy riddles',
  ],
};

function isAnswerTooSimilarServer(ans1?: string, ans2?: string): boolean {
  if (!ans1 || !ans2) return false;
  const a1 = ans1.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
  const a2 = ans2.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
  if (!a1 || !a2) return false;
  if (a1 === a2) return true;

  const compact1 = a1.replace(/\s+/g, '');
  const compact2 = a2.replace(/\s+/g, '');
  if (compact1 === compact2) return true;
  if (compact1 + 's' === compact2 || compact2 + 's' === compact1) return true;
  if (compact1 + 'es' === compact2 || compact2 + 'es' === compact1) return true;

  if (compact1.length >= 4 && compact2.length >= 4) {
    if (compact1.includes(compact2) || compact2.includes(compact1)) return true;
  }
  return false;
}

function isQuestionTooSimilarServer(q1: string, q2: string): boolean {
  if (!q1 || !q2) return false;
  const s1 = q1.trim().toLowerCase();
  const s2 = q2.trim().toLowerCase();
  if (s1 === s2) return true;
  if (s1.length > 15 && s2.length > 15) {
    if (s1.includes(s2) || s2.includes(s1)) return true;
  }
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'from',
    'what', 'which', 'who', 'how', 'many', 'there', 'you', 'your', 'if',
    'does', 'did', 'do', 'can', 'will', 'would', 'could', 'should',
  ]);
  const extractWords = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
  const w1 = extractWords(q1);
  const w2 = extractWords(q2);
  if (w1.length === 0 || w2.length === 0) return false;
  const set1 = new Set(w1);
  const set2 = new Set(w2);
  let overlap = 0;
  for (const w of set1) {
    if (set2.has(w)) overlap++;
  }
  const union = new Set([...w1, ...w2]).size;
  if (overlap / Math.max(1, union) >= 0.33) return true;

  // Check 2-word bigrams if there is vocabulary overlap
  if (w1.length >= 2 && w2.length >= 2 && overlap >= 2) {
    const bigrams1 = new Set<string>();
    for (let i = 0; i <= w1.length - 2; i++) {
      bigrams1.add(`${w1[i]}_${w1[i + 1]}`);
    }
    for (let j = 0; j <= w2.length - 2; j++) {
      if (bigrams1.has(`${w2[j]}_${w2[j + 1]}`)) return true;
    }
  }

  // Check 3-word n-gram shingles
  if (w1.length >= 3 && w2.length >= 3) {
    const trigrams1 = new Set<string>();
    for (let i = 0; i <= w1.length - 3; i++) {
      trigrams1.add(`${w1[i]}_${w1[i + 1]}_${w1[i + 2]}`);
    }
    for (let j = 0; j <= w2.length - 3; j++) {
      if (trigrams1.has(`${w2[j]}_${w2[j + 1]}_${w2[j + 2]}`)) return true;
    }
  }

  return false;
}

function isBrainTeaserDuplicateServer(
  candidate: { question: string; options?: string[]; correctAnswerIndex?: number },
  recentQuestions: string[],
  recentAnswers: string[] = []
): boolean {
  if (!candidate || !candidate.question) return false;

  if (recentQuestions.some((rq) => isQuestionTooSimilarServer(candidate.question, rq))) {
    return true;
  }

  if (
    Array.isArray(candidate.options) &&
    typeof candidate.correctAnswerIndex === 'number' &&
    candidate.options[candidate.correctAnswerIndex]
  ) {
    const candidateAnswer = candidate.options[candidate.correctAnswerIndex];
    if (recentAnswers.some((ra) => isAnswerTooSimilarServer(candidateAnswer, ra))) {
      return true;
    }
  }

  return false;
}

function getFallbackCatalogTeaser(
  gradeLevel: string,
  excludeIds: string[] = [],
  preferredSubject?: string,
  recentQuestions: string[] = [],
  recentAnswers: string[] = []
): BrainTeaser {
  let gradeTeasers = BRAIN_TEASERS_CATALOG.filter((t) => t.gradeLevel === gradeLevel);
  if (preferredSubject && preferredSubject !== 'any') {
    const subjectMatches = gradeTeasers.filter((t) => t.subject === preferredSubject);
    if (subjectMatches.length > 0) {
      gradeTeasers = subjectMatches;
    } else {
      const allSubjectMatches = BRAIN_TEASERS_CATALOG.filter((t) => t.subject === preferredSubject);
      if (allSubjectMatches.length > 0) {
        gradeTeasers = allSubjectMatches;
      }
    }
  }

  // 1. Filter out exact completed IDs AND questions/answers too similar to recent history
  const strictCandidates = gradeTeasers.filter(
    (t) => !excludeIds.includes(t.id) && !isBrainTeaserDuplicateServer(t, recentQuestions, recentAnswers)
  );
  if (strictCandidates.length > 0) {
    const pick = strictCandidates[Math.floor(Math.random() * strictCandidates.length)];
    return { ...pick, isAiGenerated: false };
  }

  // 2. Try uncompleted catalog questions across all grades that avoid similarity
  const allCandidates = BRAIN_TEASERS_CATALOG.filter(
    (t) => !excludeIds.includes(t.id) && !isBrainTeaserDuplicateServer(t, recentQuestions, recentAnswers)
  );
  if (allCandidates.length > 0) {
    const pick = allCandidates[Math.floor(Math.random() * allCandidates.length)];
    return { ...pick, isAiGenerated: false };
  }

  // 3. Fallback to uncompleted IDs in current grade
  const idCandidates = gradeTeasers.filter((t) => !excludeIds.includes(t.id));
  if (idCandidates.length > 0) {
    const pick = idCandidates[Math.floor(Math.random() * idCandidates.length)];
    return { ...pick, isAiGenerated: false };
  }

  const pool = gradeTeasers.length > 0 ? gradeTeasers : BRAIN_TEASERS_CATALOG;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { ...pick, isAiGenerated: false };
}

app.post(['/api/brain-teasers/generate', '/api/brain-teasers/daily'], async (req, res) => {
  try {
    const {
      gradeLevel = '1st_grade',
      kidName = 'Explorer',
      excludeQuestionIds = [],
      recentQuestions = [],
      recentConcepts = [],
      recentAnswers = [],
      preferredSubject,
    } = req.body;

    const validGrade = (gradeLevel in GRADE_CURRICULUM_GUIDELINES) ? gradeLevel : '1st_grade';
    const curriculumGuide = GRADE_CURRICULUM_GUIDELINES[validGrade] || GRADE_CURRICULUM_GUIDELINES['1st_grade'];

    const sanitizedRecent = (Array.isArray(recentQuestions) ? recentQuestions : [])
      .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
      .slice(0, 50);

    const sanitizedAnswers = (Array.isArray(recentAnswers) ? recentAnswers : [])
      .filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
      .slice(0, 35);

    const sanitizedConcepts = (Array.isArray(recentConcepts) ? recentConcepts : [])
      .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      .slice(0, 25);

    const ai = getGenAI();

    if (ai && !isGeminiQuotaExhausted()) {
      // Pick a random sub-topic from the curriculum matrix that doesn't conflict with recent concepts
      const topicOptions = CURRICULUM_TOPIC_MATRIX[validGrade] || CURRICULUM_TOPIC_MATRIX['1st_grade'];
      const unusedTopics = topicOptions.filter(
        (top) => !sanitizedConcepts.some((c) => top.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(top.toLowerCase()))
      );
      const activeTopics = unusedTopics.length > 0 ? unusedTopics : topicOptions;

      // Gemini generation loop with up to 3 smart retry attempts if a duplicate or similar question is generated
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const chosenTopic = activeTopics[Math.floor(Math.random() * activeTopics.length)];

          const subjectInstruction = preferredSubject && preferredSubject !== 'any'
            ? `Focus strictly on the subject: "${preferredSubject}". Target thematic area: "${chosenTopic}".`
            : `Target learning sub-topic: "${chosenTopic}". Select an engaging subject among math, science, nature, wordplay, logic, or riddle (rotating away from recently seen concepts: ${sanitizedConcepts.slice(0, 5).join(', ') || 'none'}).`;

          const recentFilter = sanitizedRecent.length > 0
            ? `CRITICAL ANTI-REPETITION MANDATE:
The student has already completed the following questions. You MUST NOT repeat any of these, nor ask questions with similar punchlines, scenarios, or duplicate numbers/solutions:
${sanitizedRecent.slice(0, 35).map((q) => `- "${q}"`).join('\n')}

DO NOT USE TIRED CLICHÉ RIDDLES (e.g. what gets wetter as it dries, what has hands but cannot clap, what has to be broken before you use it, what goes up and never comes down, what belongs to you but others use it, footsteps, the piano, the coin).
Every single question MUST be fresh, creative, educational, and grounded in authentic learning!`
            : `GUARANTEE FRESHNESS: Provide a novel, creative, and educational question. DO NOT use cliché or overused riddles (e.g. towel, clock, egg, piano, coin).`;

          const bannedAnswersClause = sanitizedAnswers.length > 0
            ? `BANNED RECENT SOLUTIONS & ANSWERS (The correct answer CANNOT be any of these):
${sanitizedAnswers.slice(0, 25).map((a) => `- "${a}"`).join('\n')}`
            : '';

          const retryClarification = attempt > 1
            ? `NOTE (Attempt ${attempt}): The previous candidate was too similar to an existing completed question or answer. You must pick an entirely DIFFERENT premise, entity, and question setup!`
            : '';

          const prompt = `You are a master STEM & humanities educator crafting an interactive, daily brain teaser for a student named "${kidName}".
The primary purpose is to help the child LEARN something genuinely new or VERIFY their school curriculum understanding, eliminating rote memorization.

${curriculumGuide}

${subjectInstruction}
${retryClarification}
${recentFilter}
${bannedAnswersClause}

Requirements:
1. Provide exactly FOUR multiple-choice options in the "options" array.
2. The question must have ONE unambiguously correct answer and three plausible, age-appropriate distractors.
3. Vary the index of the correct answer (correctAnswerIndex must be 0, 1, 2, or 3).
4. Provide a friendly "hint" that guides their thinking without spoiling the answer.
5. Provide a "thinkingAngle" (a mental model, problem-solving strategy, or way to think outside the box).
6. Provide a "funFactExplanation": 2-3 sentences explaining WHY the answer is correct, followed by a fascinating "Did you know?" bonus fact that creates an inspiring learning moment.

Respond in strict JSON with no surrounding text or markdown ticks:
{
  "subject": "math" | "science" | "nature" | "wordplay" | "logic" | "riddle",
  "subjectLabel": "Short Topic Label (e.g. Solar System, Fractions, Rainforest Wildlife, Phonics)",
  "subjectIcon": "single emoji matching the topic",
  "question": "The question text here",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correctAnswerIndex": 0,
  "hint": "Helpful thinking clue",
  "thinkingAngle": "Smart thinking strategy or connection",
  "funFactExplanation": "Why it's correct + fascinating Did you know fact!"
}`;

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
            },
            ['gemini-3.1-flash-lite', 'gemini-flash-latest']
          );

          const text = response.text?.trim();
          if (text) {
            const parsed = JSON.parse(text);
            if (
              parsed.question &&
              Array.isArray(parsed.options) &&
              parsed.options.length === 4 &&
              typeof parsed.correctAnswerIndex === 'number' &&
              parsed.correctAnswerIndex >= 0 &&
              parsed.correctAnswerIndex < 4
            ) {
              // Anti-repetition gate: verify candidate question & answer against both history and catalog
              const isDuplicateHistory = isBrainTeaserDuplicateServer(parsed, sanitizedRecent, sanitizedAnswers);
              const isDuplicateCatalog = BRAIN_TEASERS_CATALOG.some(
                (c) => isQuestionTooSimilarServer(parsed.question, c.question)
              );

              if (!isDuplicateHistory && !isDuplicateCatalog) {
                const validSubjects = ['math', 'science', 'nature', 'wordplay', 'logic', 'riddle'];
                const subject = validSubjects.includes(parsed.subject) ? parsed.subject : 'science';

                const teaser: BrainTeaser = {
                  id: `ai-teaser-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  gradeLevel: validGrade as GradeLevel,
                  subject: subject as any,
                  subjectLabel: parsed.subjectLabel || 'Curriculum Challenge',
                  subjectIcon: parsed.subjectIcon || '💡',
                  question: parsed.question,
                  options: parsed.options,
                  correctAnswerIndex: parsed.correctAnswerIndex,
                  hint: parsed.hint || 'Take a moment to reason through each option!',
                  thinkingAngle: parsed.thinkingAngle || 'Look for key clues hidden inside the question details.',
                  funFactExplanation: parsed.funFactExplanation || "Great job! That's the correct answer.",
                  isAiGenerated: true,
                  conceptTag: parsed.subjectLabel,
                };

                res.json({
                  success: true,
                  source: 'gemini',
                  teaser,
                });
                return;
              } else {
                console.info(`[Server] Gemini candidate (attempt ${attempt}/${maxAttempts}) flagged as duplicate/similar, regenerating with alternate seed...`);
              }
            }
          }
        } catch (attemptErr: any) {
          const errStr = String(attemptErr?.message || attemptErr || '');
          if (
            errStr.includes('429') ||
            errStr.includes('RESOURCE_EXHAUSTED') ||
            errStr.includes('quota') ||
            errStr.includes('Quota')
          ) {
            triggerGeminiQuotaCooldown(60);
            console.info('[Server] Gemini rate limit/quota reached; seamlessly serving from verified catalog.');
            break; // Stop immediately to avoid hammering rate-limited quota
          }
          console.info(`[Server] Gemini generation attempt ${attempt} unavailable, seamlessly falling back.`);
        }
      }
    }

    // Fallback to static catalog question with anti-similarity verification
    const fallback = getFallbackCatalogTeaser(validGrade, excludeQuestionIds, preferredSubject, sanitizedRecent, sanitizedAnswers);
    res.json({
      success: true,
      source: 'catalog',
      teaser: fallback,
    });
  } catch (err: any) {
    console.error('[Server] Brain teaser endpoint error:', err);
    res.status(500).json({ error: 'Failed to generate brain teaser.' });
  }
});

// Chore-Quest Sample Database Endpoint for KidCoin cross-sync
app.get('/api/chorequest/sample-db', (req, res) => {
  res.json({
    version: 1,
    settings: currentDatabase.settings,
    kids: currentDatabase.kids,
    chores: currentDatabase.chores,
    categories: currentDatabase.categories,
  });
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

    // Default: Pull database from KidCoin node with multi-endpoint probe and timeout safety
    const candidateUrls = [
      `${cleanEndpoint}/api/database`,
      `${cleanEndpoint}/api/chores`,
      `${cleanEndpoint}/chores`,
    ];
    let lastError = '';

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data: any = await resp.json();
          const fetchedDb = data.database || data;
          if (fetchedDb && fetchedDb.kids && (fetchedDb.chores || fetchedDb.goals || fetchedDb.settings)) {
            currentDatabase = {
              ...currentDatabase,
              ...fetchedDb,
              settings: {
                ...currentDatabase.settings,
                ...(fetchedDb.settings || {}),
              },
            };
            currentDatabaseRev = Date.now();
            currentDatabaseUpdatedAt = Date.now();
            persistDatabaseToDisk();
            broadcastDatabaseUpdate(currentDatabase, 'remote-kidcoin-pull');
            res.json({ success: true, database: currentDatabase, sourceUrl: url });
            return;
          }
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    res.status(502).json({
      success: false,
      message: `Failed to contact KidCoin at ${endpoint} (${lastError || 'No responding endpoints'}). Ensure the container is running on the local network.`,
    });
  } catch (err: any) {
    console.error('[Server] Cross-app sync error:', err);
    res.status(500).json({ success: false, message: err?.message || 'Cross-app sync failed.' });
  }
});

// --- Kiosk wallpapers (photos uploaded from parent settings) ---
// Stored as files in data/wallpapers so the shared database stays small.
const WALLPAPER_DIR = path.join(DATA_DIR, 'wallpapers');
const WALLPAPER_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

app.get('/api/wallpapers', async (req, res) => {
  try {
    const files = fs.existsSync(WALLPAPER_DIR) ? await fs.promises.readdir(WALLPAPER_DIR) : [];
    res.json({ wallpapers: files.filter((f) => /^[\w-]+\.(jpg|png|webp)$/.test(f)).sort().map((f) => `/api/wallpapers/${f}`) });
  } catch {
    res.json({ wallpapers: [] });
  }
});

app.post('/api/wallpapers', async (req, res) => {
  const pin = String(req.body?.pin || '');
  if (pin !== String(currentDatabase.settings?.parentPin || '')) {
    res.status(403).json({ error: 'Parent PIN required' });
    return;
  }
  const m = String(req.body?.dataUrl || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) {
    res.status(400).json({ error: 'Expected a JPEG, PNG or WebP image' });
    return;
  }
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 15 * 1024 * 1024) {
    res.status(413).json({ error: 'Image is too large' });
    return;
  }
  await fs.promises.mkdir(WALLPAPER_DIR, { recursive: true });
  const name = `wp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${WALLPAPER_EXT[m[1]]}`;
  await fs.promises.writeFile(path.join(WALLPAPER_DIR, name), buf);
  res.json({ url: `/api/wallpapers/${name}` });
});

app.get('/api/wallpapers/:file', (req, res) => {
  const f = req.params.file;
  if (!/^[\w-]+\.(jpg|png|webp)$/.test(f)) { res.status(404).end(); return; }
  const p = path.join(WALLPAPER_DIR, f);
  if (!fs.existsSync(p)) { res.status(404).end(); return; }
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(p);
});

app.delete('/api/wallpapers/:file', async (req, res) => {
  const f = req.params.file;
  if (String(req.headers['x-parent-pin'] || '') !== String(currentDatabase.settings?.parentPin || '')) {
    res.status(403).json({ error: 'Parent PIN required' });
    return;
  }
  if (!/^[\w-]+\.(jpg|png|webp)$/.test(f)) { res.status(404).end(); return; }
  await fs.promises.rm(path.join(WALLPAPER_DIR, f), { force: true });
  res.json({ success: true });
});

// --- Version: which build is running (written by the Vite build to dist/version.json) ---
app.get('/api/version', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  try {
    const info = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'dist', 'version.json'), 'utf8'));
    res.json({ app: 'ChoreQuest', ...info });
  } catch {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
      res.json({ app: 'ChoreQuest', version: pkg.version, commit: 'unknown', builtAt: null, note: 'dev server (not a production build)' });
    } catch {
      res.json({ app: 'ChoreQuest', version: 'unknown' });
    }
  }
});

// --- Family Wish Catalog: product photos and the optional Best Buy lookup ---
const WISH_PHOTO_DIR = path.join(DATA_DIR, 'wish-photos');
const WISH_FILE_RE = /^[\w-]+\.(jpg|png|webp)$/;

app.post('/api/wish-photos', async (req, res) => {
  if (String(req.body?.pin || '') !== String(currentDatabase.settings?.parentPin || '')) {
    res.status(403).json({ error: 'Parent PIN required' });
    return;
  }
  const m = String(req.body?.dataUrl || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) {
    res.status(400).json({ error: 'Expected a JPEG, PNG or WebP image' });
    return;
  }
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 8 * 1024 * 1024) {
    res.status(413).json({ error: 'Image is too large' });
    return;
  }
  await fs.promises.mkdir(WISH_PHOTO_DIR, { recursive: true });
  const name = `wish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${WALLPAPER_EXT[m[1]]}`;
  await fs.promises.writeFile(path.join(WISH_PHOTO_DIR, name), buf);
  res.json({ url: `/api/wish-photos/${name}` });
});

app.get('/api/wish-photos/:file', (req, res) => {
  const f = req.params.file;
  const p = path.join(WISH_PHOTO_DIR, f);
  if (!WISH_FILE_RE.test(f) || !fs.existsSync(p)) { res.status(404).end(); return; }
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(p);
});

app.delete('/api/wish-photos/:file', async (req, res) => {
  if (String(req.headers['x-parent-pin'] || '') !== String(currentDatabase.settings?.parentPin || '')) {
    res.status(403).json({ error: 'Parent PIN required' });
    return;
  }
  const f = req.params.file;
  if (!WISH_FILE_RE.test(f)) { res.status(404).end(); return; }
  await fs.promises.rm(path.join(WISH_PHOTO_DIR, f), { force: true });
  res.json({ success: true });
});

// Best Buy's official Products API (free key at developer.bestbuy.com). Exact name,
// price and photo for a SKU; no key means parents type the details themselves.
app.get('/api/bestbuy/:sku', async (req, res) => {
  const sku = String(req.params.sku || '');
  const key = process.env.BESTBUY_API_KEY;
  if (!/^\d{6,8}$/.test(sku)) { res.status(400).json({ found: false, reason: 'bad-sku' }); return; }
  if (!key) { res.json({ found: false, reason: 'no-key' }); return; }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const r = await fetch(`https://api.bestbuy.com/v1/products/${sku}.json?apiKey=${encodeURIComponent(key)}&show=sku,name,salePrice,regularPrice,url,image,largeFrontImage`, { signal: controller.signal });
    if (!r.ok) { res.json({ found: false, reason: `http-${r.status}` }); return; }
    const j: any = await r.json();
    if (!j?.name) { res.json({ found: false, reason: 'not-found' }); return; }
    res.json({ found: true, name: j.name, price: j.salePrice ?? j.regularPrice, photo: j.largeFrontImage || j.image, url: j.url });
  } catch (e: any) {
    res.json({ found: false, reason: e?.name === 'AbortError' ? 'timeout' : 'error' });
  } finally {
    clearTimeout(t);
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
