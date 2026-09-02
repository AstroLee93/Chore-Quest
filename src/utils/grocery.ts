import {
  GroceryCategory,
  GroceryItem,
  GroceryImportance,
  SpiceItem,
  GroceryRequest,
  PantryStapleItem,
  WeeklyGroceryList,
  WeeklyDinnerMenu,
  DayOfWeekKey,
} from '../types';

export const GROCERY_IMPORTANCE_METADATA: Record<
  GroceryImportance,
  { label: string; icon: string; badgeBg: string; badgeText: string; badgeBorder: string }
> = {
  staple: {
    label: 'Staple',
    icon: '⭐️',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-800 dark:text-blue-300',
    badgeBorder: 'border-blue-300 dark:border-blue-800',
  },
  common: {
    label: 'Common',
    icon: '📦',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-800 dark:text-slate-300',
    badgeBorder: 'border-slate-300 dark:border-slate-700',
  },
  treat: {
    label: 'Treat',
    icon: '🍬',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-300 dark:border-amber-800',
  },
  luxury: {
    label: 'Luxury',
    icon: '👑',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-800 dark:text-purple-300',
    badgeBorder: 'border-purple-300 dark:border-purple-800',
  },
};

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const GROCERY_CATEGORY_ORDER: GroceryCategory[] = [
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
];

export interface GroceryCategoryMeta {
  id: GroceryCategory;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  description: string;
}

export const GROCERY_CATEGORY_METADATA: Record<GroceryCategory, GroceryCategoryMeta> = {
  produce: {
    id: 'produce',
    label: 'Produce & Fresh Greens',
    shortLabel: 'Produce',
    icon: '🥦',
    color: '#10b981',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-300',
    description: 'Fresh fruits, vegetables, salad greens, and herbs',
  },
  dairy_eggs: {
    id: 'dairy_eggs',
    label: 'Dairy & Farm Eggs',
    shortLabel: 'Dairy & Eggs',
    icon: '🥛',
    color: '#eab308',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    badgeText: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-300',
    description: 'Milk, cheese, butter, yogurt, cream, and eggs',
  },
  meat_seafood: {
    id: 'meat_seafood',
    label: 'Meat & Seafood',
    shortLabel: 'Meat & Fish',
    icon: '🥩',
    color: '#ef4444',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    badgeText: 'text-rose-700 dark:text-rose-400',
    borderClass: 'border-rose-300',
    description: 'Chicken, beef, pork, bacon, salmon, shrimp, and deli meats',
  },
  bakery: {
    id: 'bakery',
    label: 'Bakery & Fresh Breads',
    shortLabel: 'Bakery',
    icon: '🍞',
    color: '#f97316',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
    badgeText: 'text-orange-700 dark:text-orange-400',
    borderClass: 'border-orange-300',
    description: 'Sandwich breads, buns, tortillas, bagels, and pita',
  },
  pantry: {
    id: 'pantry',
    label: 'Pantry & Dry Goods',
    shortLabel: 'Pantry',
    icon: '🥫',
    color: '#d97706',
    badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800',
    badgeText: 'text-yellow-800 dark:text-yellow-400',
    borderClass: 'border-yellow-300',
    description: 'Pasta, rice, oils, sauces, canned beans, spices, flour, and cereal',
  },
  frozen: {
    id: 'frozen',
    label: 'Frozen Foods',
    shortLabel: 'Frozen',
    icon: '🧊',
    color: '#06b6d4',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
    badgeText: 'text-cyan-700 dark:text-cyan-400',
    borderClass: 'border-cyan-300',
    description: 'Frozen veggies, waffles, pizza, ice cream, and nuggets',
  },
  snacks: {
    id: 'snacks',
    label: 'Snacks & Treats',
    shortLabel: 'Snacks',
    icon: '🥨',
    color: '#a855f7',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    badgeText: 'text-purple-700 dark:text-purple-400',
    borderClass: 'border-purple-300',
    description: 'Crackers, chips, granola bars, fruit snacks, cookies, and popcorn',
  },
  beverages: {
    id: 'beverages',
    label: 'Beverages & Juices',
    shortLabel: 'Beverages',
    icon: '🧃',
    color: '#0ea5e9',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    badgeText: 'text-sky-700 dark:text-sky-400',
    borderClass: 'border-sky-300',
    description: 'Coffee, tea, orange juice, sparkling water, apple cider, and drink mixes',
  },
  household: {
    id: 'household',
    label: 'Household & Essentials',
    shortLabel: 'Household',
    icon: '🧻',
    color: '#64748b',
    badgeBg: 'bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    badgeText: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-300',
    description: 'Paper towels, toilet paper, trash bags, dish soap, foils, and zip bags',
  },
  other: {
    id: 'other',
    label: 'General & Miscellaneous',
    shortLabel: 'General',
    icon: '🛒',
    color: '#6b7280',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    badgeText: 'text-indigo-700 dark:text-indigo-400',
    borderClass: 'border-indigo-300',
    description: 'Special requests, pet supplies, pharmacy, and miscellaneous items',
  },
};

/**
 * Intelligent category classifier based on item name keywords
 */
export const detectGroceryCategory = (itemName: string): GroceryCategory => {
  if (!itemName) return 'other';
  const name = itemName.toLowerCase().trim();

  // Produce
  if (
    /apple|banana|berry|berries|strawberry|blueberry|raspberry|lemon|lime|orange|grape|melon|watermelon|avocado|tomato|onion|garlic|lettuce|spinach|kale|celery|carrot|cucumber|potato|pepper|broccoli|herbs|basil|cilantro|parsley|mushroom|zucchini|ginger|produce|salad|fruit|veg/.test(
      name
    )
  ) {
    return 'produce';
  }

  // Dairy & Eggs
  if (
    /milk|cream|butter|cheddar|mozzarella|parmesan|cheese|egg|eggs|yogurt|sour cream|cottage cheese|half and half|half & half|feta|gouda|dairy/.test(
      name
    )
  ) {
    return 'dairy_eggs';
  }

  // Meat & Seafood
  if (
    /chicken|beef|ground beef|steak|pork|bacon|sausage|turkey|ham|meatball|salmon|tuna|shrimp|fish|tilapia|cod|patty|patties|prosciutto|meat|ribs|lamb/.test(
      name
    )
  ) {
    return 'meat_seafood';
  }

  // Bakery & Bread
  if (
    /bread|bun|buns|tortilla|tortillas|bagel|bagels|croissant|pita|roll|rolls|crust|wrap|wraps|sourdough|brioche|muffin|bakery/.test(
      name
    )
  ) {
    return 'bakery';
  }

  // Frozen
  if (
    /frozen|ice cream|waffle|waffles|nugget|nuggets|frozen pizza|popsicle|tater tot|fries|frozen berries|dumpling|dumplings|gelato|sorbet/.test(
      name
    )
  ) {
    return 'frozen';
  }

  // Snacks & Treats
  if (
    /snack|chips|cracker|crackers|pretzel|pretzels|cookie|cookies|popcorn|gummy|gummies|candy|chocolate|granola bar|trail mix|nut|nuts|almonds|cashews|peanut|peanuts|fruit snack|treat|treats/.test(
      name
    )
  ) {
    return 'snacks';
  }

  // Beverages
  if (
    /juice|coffee|tea|sparkling water|seltzer|soda|coke|sprite|water|lemonade|cider|smoothie|kombucha|drink|beverage|espresso/.test(
      name
    )
  ) {
    return 'beverages';
  }

  // Household & Essentials
  if (
    /paper towel|toilet paper|trash bag|foil|ziploc|sponge|dish soap|detergent|bleach|cleaner|napkin|napkins|soap|shampoo|toothpaste|wipe|wipes|battery|batteries|household|parchment/.test(
      name
    )
  ) {
    return 'household';
  }

  // Pantry & Dry Goods
  if (
    /pasta|rice|spaghetti|macaroni|noodle|noodles|sauce|marinara|olive oil|vegetable oil|oil|vinegar|salt|pepper|spice|spices|flour|sugar|honey|syrup|peanut butter|jelly|jam|cereal|oat|oats|oatmeal|canned|bean|beans|chickpea|taco seasoning|broth|stock|ketchup|mustard|mayo|mayonnaise|salsa|soy sauce/.test(
      name
    )
  ) {
    return 'pantry';
  }

  return 'other';
};

/**
 * Standard default pantry staples for family tracking with clean initial state
 */
export const DEFAULT_PANTRY_STAPLES: PantryStapleItem[] = [];

/**
 * Initial Clean Grocery List
 */
export const DEFAULT_WEEKLY_GROCERY_LIST: WeeklyGroceryList = {
  title: 'Weekly Family Groceries',
  weekStartDate: getTodayDateString(),
  lastUpdated: new Date().toISOString(),
  pantryStaples: [],
  spices: [],
  requests: [],
  items: [],
};

/**
 * Returns all depleted items across household groceries and pantry staples
 */
export const getPantryDepletedItems = (groceryList: WeeklyGroceryList): { id: string; name: string; category: GroceryCategory; quantity?: string; icon?: string; depletedBy?: string; notes?: string; importance?: GroceryImportance }[] => {
  const result: { id: string; name: string; category: GroceryCategory; quantity?: string; icon?: string; depletedBy?: string; notes?: string; importance?: GroceryImportance }[] = [];
  const seen = new Set<string>();

  // Check all grocery items marked as depleted or replenish items
  (groceryList.items || []).forEach((item) => {
    if (item.isDepleted || item.isReplenishItem) {
      const key = item.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          icon: GROCERY_CATEGORY_METADATA[item.category]?.icon || '🛒',
          depletedBy: item.depletedBy,
          notes: item.notes,
          importance: item.importance,
        });
      }
    }
  });

  // Also include any legacy pantryStaples that are depleted
  (groceryList.pantryStaples || []).forEach((staple) => {
    if (staple.isDepleted) {
      const key = staple.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          id: staple.id,
          name: staple.name,
          category: staple.category,
          quantity: staple.defaultQuantity,
          icon: staple.icon || '🥫',
          depletedBy: staple.depletedBy,
          notes: staple.notes,
          importance: staple.importance,
        });
      }
    }
  });

  // Also check empty spices that need replenishment
  (groceryList.spices || []).forEach((spice) => {
    if (spice.isEmpty && spice.needsReplenish) {
      const key = spice.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          id: spice.id,
          name: `${spice.name} (Seasoning)`,
          category: 'pantry',
          quantity: '1 Container',
          icon: '🧂',
          depletedBy: spice.addedBy,
          notes: spice.notes,
          importance: 'staple',
        });
      }
    }
  });

  return result;
};

/**
 * Imports all depleted items into the active grocery list (avoiding duplicate names)
 */
export const importDepletedItemsToGroceryList = (
  currentList: WeeklyGroceryList,
  customDepleted?: { id: string; name: string; category: GroceryCategory; quantity?: string; depletedBy?: string; notes?: string; importance?: GroceryImportance }[]
): { updatedList: WeeklyGroceryList; importedCount: number } => {
  const itemsToImport = customDepleted || getPantryDepletedItems(currentList);
  const existingNames = new Set(
    (currentList.items || []).map((item) => item.name.toLowerCase().trim())
  );

  const newItems: GroceryItem[] = [];

  itemsToImport.forEach((dep) => {
    if (!existingNames.has(dep.name.toLowerCase().trim())) {
      newItems.push({
        id: `g-rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: dep.name,
        category: dep.category,
        quantity: dep.quantity || '1',
        importance: dep.importance || 'staple',
        acquired: false,
        isDepleted: false,
        addedBy: dep.depletedBy ? `Replenish (${dep.depletedBy})` : 'Pantry Replenishment',
        notes: dep.notes,
        isReplenishItem: true,
        createdAt: getTodayDateString(),
      });
      existingNames.add(dep.name.toLowerCase().trim());
    }
  });

  const updatedList: WeeklyGroceryList = {
    ...currentList,
    items: [...(currentList.items || []), ...newItems],
    lastUpdated: new Date().toISOString(),
  };

  return {
    updatedList,
    importedCount: newItems.length,
  };
};

/**
 * Parses raw ingredient strings from recipes or meal plans into clean GroceryItems
 */
export const parseIngredientToGroceryItem = (
  rawIngredient: string,
  sourceDay?: DayOfWeekKey,
  sourceRecipeName?: string
): GroceryItem => {
  const clean = rawIngredient.trim().replace(/^[-•*]\s*/, '');
  const category = detectGroceryCategory(clean);

  // Extract quantity if present at start (e.g. "1 lb Ground Beef", "2 tbsp Olive Oil", "8 Warm Tortillas")
  let quantity: string | undefined = undefined;
  let name = clean;

  const match = clean.match(/^([\d\/\.\s-]+(?:lbs?|pounds?|oz|ounces?|tbsp|tsp|cups?|pack|packet|packs|cloves?|slices?|cans?|jars?|bottles?|bunches?|cartons?|heads?|bags?|dozen|gallons?|boxes?|ct)?)\s+(.+)$/i);
  if (match && match[1] && match[2]) {
    quantity = match[1].trim();
    name = match[2].trim();
  }

  return {
    id: `g-menu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    category,
    quantity,
    acquired: false,
    addedBy: sourceRecipeName ? `Recipe: ${sourceRecipeName}` : sourceDay ? `Dinner Menu (${sourceDay})` : 'Weekly Dinner Menu',
    sourceMealDay: sourceDay,
    sourceRecipe: sourceRecipeName,
    createdAt: getTodayDateString(),
  };
};

/**
 * Extracts all dinner ingredients from the active Weekly Dinner Menu
 */
export const extractIngredientsFromMenu = (menu?: WeeklyDinnerMenu): GroceryItem[] => {
  if (!menu || !menu.days) return [];
  const items: GroceryItem[] = [];
  const seen = new Set<string>();

  (Object.keys(menu.days) as DayOfWeekKey[]).forEach((dayKey) => {
    const plan = menu.days[dayKey];
    if (!plan) return;

    if (plan.recipe && Array.isArray(plan.recipe.ingredients) && plan.recipe.ingredients.length > 0) {
      plan.recipe.ingredients.forEach((raw) => {
        const item = parseIngredientToGroceryItem(raw, dayKey, plan.mainDish);
        const dedupeKey = item.name.toLowerCase().trim();
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          items.push(item);
        }
      });
    } else if (plan.mainDish && plan.mainDish.trim().length > 0) {
      // Add main dish core item
      const item = parseIngredientToGroceryItem(plan.mainDish, dayKey);
      const dedupeKey = item.name.toLowerCase().trim();
      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        items.push(item);
      }
    }
  });

  return items;
};

/**
 * Starts a new weekly grocery list, handling the user's confirmation on replenishment items
 */
export const startNewWeeklyGroceryList = (
  currentList: WeeklyGroceryList,
  includeReplenishments: boolean,
  includeDinnerMenu: boolean = false,
  menu?: WeeklyDinnerMenu
): WeeklyGroceryList => {
  let initialItems: GroceryItem[] = [];

  // 1. Add Replenished items if user confirmed YES
  if (includeReplenishments) {
    const depletedStaples = getPantryDepletedItems(currentList);
    depletedStaples.forEach((staple) => {
      initialItems.push({
        id: `g-rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: staple.name,
        category: staple.category,
        quantity: staple.quantity || '1',
        importance: staple.importance || 'staple',
        acquired: false,
        isDepleted: false,
        addedBy: staple.depletedBy ? `Replenish (${staple.depletedBy})` : 'Pantry Replenishment',
        notes: staple.notes,
        isReplenishItem: true,
        createdAt: getTodayDateString(),
      });
    });
  }

  // 2. Add Dinner Menu ingredients if selected
  if (includeDinnerMenu && menu) {
    const menuItems = extractIngredientsFromMenu(menu);
    const existing = new Set(initialItems.map((i) => i.name.toLowerCase().trim()));
    menuItems.forEach((mItem) => {
      if (!existing.has(mItem.name.toLowerCase().trim())) {
        initialItems.push(mItem);
        existing.add(mItem.name.toLowerCase().trim());
      }
    });
  }

  return {
    ...currentList,
    title: 'Weekly Family Groceries',
    weekStartDate: getTodayDateString(),
    items: initialItems,
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Group grocery items by Category
 */
export const groupGroceryItemsByCategory = (
  items: GroceryItem[]
): Record<GroceryCategory, GroceryItem[]> => {
  const groups: Record<GroceryCategory, GroceryItem[]> = {
    produce: [],
    dairy_eggs: [],
    meat_seafood: [],
    bakery: [],
    pantry: [],
    frozen: [],
    snacks: [],
    beverages: [],
    household: [],
    other: [],
  };

  (items || []).forEach((item) => {
    const cat = item.category || 'other';
    if (groups[cat]) {
      groups[cat].push(item);
    } else {
      groups.other.push(item);
    }
  });

  return groups;
};
