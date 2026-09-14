import { FamilyDatabase, KidProfile, SavingsGoal, KidCoinTransaction } from '../types';

export interface KidCoinConfig {
  endpoint: string; // e.g. 'http://localhost:3000', 'http://kidcoin-vault:3000', or custom IP
  autoSync: boolean;
  syncIntervalMinutes: number;
  lastSyncTimestamp: number | null;
  pointToDollarRatio: number; // e.g. 0.10 -> 1 star = $0.10
  bankInterestRateMonthlyPercent: number; // e.g. 5 -> 5%
  lastInterestAppliedMonth: string | null; // e.g. '2025-03'
}

export const DEFAULT_KIDCOIN_CONFIG: KidCoinConfig = {
  endpoint: 'http://localhost:5000',
  autoSync: false,
  syncIntervalMinutes: 15,
  lastSyncTimestamp: null,
  pointToDollarRatio: 0.10,
  bankInterestRateMonthlyPercent: 5,
  lastInterestAppliedMonth: null,
};

const KIDCOIN_CONFIG_STORAGE_KEY = 'chorequest_kidcoin_sync_config_v1';

export function getKidCoinConfig(): KidCoinConfig {
  try {
    const raw = localStorage.getItem(KIDCOIN_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_KIDCOIN_CONFIG, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...DEFAULT_KIDCOIN_CONFIG };
}

export function saveKidCoinConfig(cfg: Partial<KidCoinConfig>): KidCoinConfig {
  const current = getKidCoinConfig();
  const updated = { ...current, ...cfg };
  try {
    localStorage.setItem(KIDCOIN_CONFIG_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function getTodayMonthString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export const PORTAINER_DOCKER_COMPOSE_SNIPPET = `version: '3.8'

services:
  # AstroLee93/Chore-Quest Container (Family Gamified Chores & Hub)
  chore-quest:
    image: astrolee93/chore-quest:latest
    container_name: chore-quest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - CORS_ORIGIN=*
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    volumes:
      - chorequest-data:/app/data
    networks:
      - family-pi-net

  # KidCoin Vault Container (Savings, Goals, Compound Growth & Retail Engine)
  kidcoin-vault:
    image: astrolee93/kid-coin:latest
    container_name: kidcoin-vault
    restart: unless-stopped
    ports:
      - "5000:3000"
    environment:
      - PORT=3000
      - CHOREQUEST_URL=http://chore-quest:3000
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    volumes:
      - kidcoin-data:/app/data
    depends_on:
      - chore-quest
    networks:
      - family-pi-net

volumes:
  chorequest-data:
    driver: local
  kidcoin-data:
    driver: local

networks:
  family-pi-net:
    driver: bridge
`;

/**
 * Fetch database from KidCoin node via our server proxy to eliminate browser CORS blocks
 */
export async function pullFromKidCoin(endpoint: string): Promise<{ success: boolean; database?: any; message?: string }> {
  try {
    const res = await fetch('/api/chorequest/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        action: 'pull',
      }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to pull from KidCoin node' };
  }
}

/**
 * Push current database to KidCoin node via our server proxy
 */
export async function pushToKidCoin(endpoint: string, database: FamilyDatabase): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/chorequest/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        action: 'push',
        database,
      }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to push to KidCoin node' };
  }
}

/**
 * Apply monthly Bank of Mom & Dad matching compound interest (e.g. 5%)
 */
export function calculateMonthlyInterest(
  kids: KidProfile[],
  interestRatePercent: number = 5
): {
  updatedKids: KidProfile[];
  totalInterestPaid: number;
  transactionsGenerated: KidCoinTransaction[];
} {
  const rate = Math.max(0, interestRatePercent) / 100;
  let totalInterestPaid = 0;
  const transactionsGenerated: KidCoinTransaction[] = [];
  const today = new Date().toISOString().split('T')[0];

  const updatedKids = kids.map((kid) => {
    // Total eligible for interest is totalSaved + liquid balance
    const currentTotal = (kid.totalSaved || 0) + (kid.kidCoinBalance || 0);
    if (currentTotal <= 0) return kid;

    const earnedInterest = Number((currentTotal * rate).toFixed(2));
    if (earnedInterest <= 0) return kid;

    totalInterestPaid += earnedInterest;

    const tx: KidCoinTransaction = {
      id: `tx-interest-${Date.now()}-${kid.id}`,
      kidId: kid.id,
      amount: earnedInterest,
      type: 'interest',
      description: `Bank of Mom & Dad +${interestRatePercent}% Monthly Interest Booster`,
      category: 'interest',
      timestamp: Date.now(),
      date: today,
    };
    transactionsGenerated.push(tx);

    // Apply interest to primary goal if exists, otherwise to kidCoinBalance
    const goals = kid.goals || [];
    const primaryGoal = goals.find((g) => g.priority === 'primary') || goals[0];

    let newGoals = goals;
    let newBalance = (kid.kidCoinBalance || 0);

    if (primaryGoal) {
      newGoals = goals.map((g) => {
        if (g.id === primaryGoal.id) {
          const newSaved = Number((g.currentSaved + earnedInterest).toFixed(2));
          return {
            ...g,
            currentSaved: newSaved,
          };
        }
        return g;
      });
    } else {
      newBalance = Number((newBalance + earnedInterest).toFixed(2));
    }

    const newTotalSaved = Number(((kid.totalSaved || 0) + earnedInterest).toFixed(2));

    return {
      ...kid,
      totalSaved: newTotalSaved,
      kidCoinBalance: newBalance,
      goals: newGoals,
      transactions: [tx, ...(kid.transactions || [])],
    };
  });

  return {
    updatedKids,
    totalInterestPaid: Number(totalInterestPaid.toFixed(2)),
    transactionsGenerated,
  };
}
