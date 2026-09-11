import { SavingsGoal, SavingsMilestone, KidProfile, KidCoinTransaction, FamilyDatabase } from '../types';

export interface VerifiedItem {
  id: string;
  name: string;
  category: string;
  currentCost: number;
  retailer: string;
  verifiedDate: string;
  icon: string;
  description: string;
}

export const VERIFIED_WISHLIST_ITEMS: VerifiedItem[] = [
  {
    id: 'ps5-slim',
    name: 'PlayStation 5 Slim Console',
    category: 'Gaming',
    currentCost: 499.99,
    retailer: 'Official Retailers (Sony / Best Buy)',
    verifiedDate: '2025 MSRP Checked',
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

export const generateDefaultMilestones = (targetCost: number, currentSaved: number = 0): SavingsMilestone[] => {
  const percent = targetCost > 0 ? (currentSaved / targetCost) * 100 : 0;
  return [
    {
      percent: 25,
      label: 'Troposphere Launch (25%)',
      rewardXP: 50,
      reached: percent >= 25,
      reachedAt: percent >= 25 ? new Date().toISOString() : undefined,
    },
    {
      percent: 50,
      label: 'Low Orbit Orbiting (50%)',
      rewardXP: 100,
      reached: percent >= 50,
      reachedAt: percent >= 50 ? new Date().toISOString() : undefined,
    },
    {
      percent: 75,
      label: 'Deep Space Coasting (75%)',
      rewardXP: 200,
      reached: percent >= 75,
      reachedAt: percent >= 75 ? new Date().toISOString() : undefined,
    },
    {
      percent: 100,
      label: 'Target Destination Touchdown (100%)',
      rewardXP: 500,
      reached: percent >= 100,
      reachedAt: percent >= 100 ? new Date().toISOString() : undefined,
    },
  ];
};

export const createDefaultGoalsForKid = (kidId: string, kidName: string): SavingsGoal[] => {
  if (kidId === 'kid-1' || kidName.toLowerCase().includes('leo')) {
    const target = 349.99;
    const current = 85.50;
    return [
      {
        id: `goal-${kidId}-1`,
        title: 'Nintendo Switch - OLED Model',
        category: 'Gaming',
        targetCost: target,
        isVerified: true,
        verifiedSource: 'Nintendo Store MSRP Checked',
        currentSaved: current,
        priority: 'primary',
        icon: '🎮',
        createdAt: '2026-08-01',
        milestones: generateDefaultMilestones(target, current),
      },
      {
        id: `goal-${kidId}-2`,
        title: '10,000 Robux Digital Card',
        category: 'Digital / Gaming',
        targetCost: 99.99,
        isVerified: true,
        verifiedSource: 'Roblox Official',
        currentSaved: 15.00,
        priority: 'secondary',
        icon: '🪙',
        createdAt: '2026-08-15',
        milestones: generateDefaultMilestones(99.99, 15.00),
      },
    ];
  }

  if (kidId === 'kid-2' || kidName.toLowerCase().includes('maya')) {
    const target = 169.99;
    const current = 127.50; // Maya is at 75%!
    return [
      {
        id: `goal-${kidId}-1`,
        title: 'LEGO Star Wars Millennium Falcon',
        category: 'Toys & LEGO',
        targetCost: target,
        isVerified: true,
        verifiedSource: 'LEGO Store MSRP Checked',
        currentSaved: current,
        priority: 'primary',
        icon: '🚀',
        createdAt: '2026-07-20',
        milestones: generateDefaultMilestones(target, current),
      },
      {
        id: `goal-${kidId}-2`,
        title: 'Apple AirPods 4',
        category: 'Audio',
        targetCost: 129.00,
        isVerified: true,
        verifiedSource: 'Apple Store MSRP Checked',
        currentSaved: 20.00,
        priority: 'secondary',
        icon: '🎧',
        createdAt: '2026-08-10',
        milestones: generateDefaultMilestones(129.00, 20.00),
      },
    ];
  }

  // Sam or other kids
  const target = 189.99;
  const current = 47.50; // Sam is at 25%!
  return [
    {
      id: `goal-${kidId}-1`,
      title: 'Mongoose Legion Freestyle 20" BMX',
      category: 'Sports',
      targetCost: target,
      isVerified: true,
      verifiedSource: 'Bicycle Specialists MSRP Checked',
      currentSaved: current,
      priority: 'primary',
      icon: '🚲',
      createdAt: '2026-08-05',
      milestones: generateDefaultMilestones(target, current),
    },
  ];
};

export const createDefaultTransactionsForKid = (kidId: string): KidCoinTransaction[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: `tx-${kidId}-1`,
      kidId,
      type: 'deposit',
      amount: 15.00,
      category: 'allowance',
      description: 'Weekly Allowance Direct Deposit',
      date: today,
    },
    {
      id: `tx-${kidId}-2`,
      kidId,
      type: 'deposit',
      amount: 4.50,
      category: 'chore',
      description: 'Completed Chore: Deep Clean Bedroom & Vacuum',
      date: today,
    },
    {
      id: `tx-${kidId}-3`,
      kidId,
      type: 'deposit',
      amount: 2.50,
      category: 'interest',
      description: 'Bank of Mom & Dad 5% Monthly Savings Match',
      date: today,
    },
  ];
};

/**
 * Applies Bank of Mom & Dad Monthly Savings Matching Interest to all kids
 */
export const applyMonthlyInterest = (database: FamilyDatabase): { updatedDb: FamilyDatabase; totalInterestPaid: number } => {
  const ratePercent = database.settings.bankInterestRateMonthlyPercent ?? 5;
  const rateDecimal = ratePercent / 100;
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7); // "YYYY-MM"

  let totalInterestPaid = 0;

  const updatedKids = database.kids.map((kid) => {
    const goals = kid.goals || [];
    const primaryGoal = goals.find((g) => g.priority === 'primary') || goals[0];
    const totalKidSavings = goals.reduce((acc, g) => acc + g.currentSaved, 0) + (kid.kidCoinBalance || 0);

    if (totalKidSavings <= 0) return kid;

    const interestAmount = Number((totalKidSavings * rateDecimal).toFixed(2));
    if (interestAmount <= 0) return kid;

    totalInterestPaid += interestAmount;

    // Deposit to primary goal or available cash
    let updatedGoals = goals;
    let newBalance = kid.kidCoinBalance || 0;

    if (primaryGoal) {
      updatedGoals = goals.map((g) => {
        if (g.id === primaryGoal.id) {
          const newSaved = Number((g.currentSaved + interestAmount).toFixed(2));
          return {
            ...g,
            currentSaved: newSaved,
            milestones: generateDefaultMilestones(g.targetCost, newSaved),
          };
        }
        return g;
      });
    } else {
      newBalance = Number((newBalance + interestAmount).toFixed(2));
    }

    const newTx: KidCoinTransaction = {
      id: `tx-interest-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      kidId: kid.id,
      type: 'deposit',
      amount: interestAmount,
      category: 'interest',
      description: `Bank of Mom & Dad ${ratePercent}% Monthly Interest Booster`,
      date: today,
      goalContribution: primaryGoal?.id,
    };

    return {
      ...kid,
      kidCoinBalance: newBalance,
      totalSaved: updatedGoals.reduce((acc, g) => acc + g.currentSaved, 0),
      goals: updatedGoals,
      transactions: [newTx, ...(kid.transactions || [])],
    };
  });

  const updatedDb: FamilyDatabase = {
    ...database,
    kids: updatedKids,
    settings: {
      ...database.settings,
      lastInterestCalculatedMonth: currentMonth,
    },
  };

  return { updatedDb, totalInterestPaid: Number(totalInterestPaid.toFixed(2)) };
};
