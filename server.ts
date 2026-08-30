import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { FamilyDatabase } from './src/types';
import { DEFAULT_SEED_DATA } from './src/utils/storage';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

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

// 6. SSE Real-time stream endpoint
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
