import {
  GroceryCategory,
  GroceryItem,
  PantryStapleItem,
  WeeklyGroceryList,
  WeeklyDinnerMenu,
  DayOfWeekKey,
} from '../types';

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
 * Standard default pantry staples for family tracking with initial depletion states
 */
export const DEFAULT_PANTRY_STAPLES: PantryStapleItem[] = [
  // Dairy / Fridge
  {
    id: 'staple-milk',
    name: 'Whole Milk / 2% Milk',
    category: 'dairy_eggs',
    defaultQuantity: '1 Gallon',
    icon: '🥛',
    isDepleted: true, // depleted for demo
    depletedAt: getTodayDateString(),
    depletedBy: 'Leo 🦁',
    notes: 'Nearly empty in fridge door',
  },
  {
    id: 'staple-eggs',
    name: 'Large Grade A Eggs',
    category: 'dairy_eggs',
    defaultQuantity: '1 Carton (12 count)',
    icon: '🥚',
    isDepleted: true, // depleted for demo
    depletedAt: getTodayDateString(),
    depletedBy: 'Mom',
    notes: 'Down to last 2 eggs',
  },
  {
    id: 'staple-butter',
    name: 'Salted Sweet Cream Butter',
    category: 'dairy_eggs',
    defaultQuantity: '1 Box (4 sticks)',
    icon: '🧈',
    isDepleted: false,
  },
  {
    id: 'staple-cheese',
    name: 'Shredded Cheddar & Mozzarella',
    category: 'dairy_eggs',
    defaultQuantity: '2 Bags (8 oz)',
    icon: '🧀',
    isDepleted: false,
  },
  // Bakery
  {
    id: 'staple-bread',
    name: 'Whole Wheat Sandwich Bread',
    category: 'bakery',
    defaultQuantity: '1 Loaf',
    icon: '🍞',
    isDepleted: false,
  },
  {
    id: 'staple-tortillas',
    name: 'Soft Flour Tortillas (Taco Size)',
    category: 'bakery',
    defaultQuantity: '1 Pack (10-12 ct)',
    icon: '🫓',
    isDepleted: false,
  },
  // Produce
  {
    id: 'staple-bananas',
    name: 'Fresh Organic Bananas',
    category: 'produce',
    defaultQuantity: '1 Bunch (5-6 count)',
    icon: '🍌',
    isDepleted: true,
    depletedAt: getTodayDateString(),
    depletedBy: 'Maya 🦄',
    notes: 'Kids ate all the bananas!',
  },
  {
    id: 'staple-apples',
    name: 'Crisp Honeycrisp Apples',
    category: 'produce',
    defaultQuantity: '1 Bag (3 lbs)',
    icon: '🍎',
    isDepleted: false,
  },
  {
    id: 'staple-garlic',
    name: 'Fresh Garlic & Yellow Onions',
    category: 'produce',
    defaultQuantity: '1 Bag / 3 bulbs',
    icon: '🧄',
    isDepleted: false,
  },
  // Pantry Staples
  {
    id: 'staple-olive-oil',
    name: 'Extra Virgin Olive Oil',
    category: 'pantry',
    defaultQuantity: '1 Bottle (750ml)',
    icon: '🫒',
    isDepleted: false,
  },
  {
    id: 'staple-peanut-butter',
    name: 'Creamy Peanut Butter (or SunButter)',
    category: 'pantry',
    defaultQuantity: '1 Jar (16 oz)',
    icon: '🥜',
    isDepleted: false,
  },
  {
    id: 'staple-pasta',
    name: 'Penne / Spaghetti Pasta',
    category: 'pantry',
    defaultQuantity: '2 Boxes (16 oz)',
    icon: '🍝',
    isDepleted: false,
  },
  {
    id: 'staple-marinara',
    name: 'Marinara Tomato Pasta Sauce',
    category: 'pantry',
    defaultQuantity: '2 Jars (24 oz)',
    icon: '🥫',
    isDepleted: false,
  },
  {
    id: 'staple-rice',
    name: 'Jasmine White Rice',
    category: 'pantry',
    defaultQuantity: '1 Bag (5 lbs)',
    icon: '🍚',
    isDepleted: false,
  },
  {
    id: 'staple-cereal',
    name: 'Honey Nut Toasted Oats / Cereal',
    category: 'pantry',
    defaultQuantity: '2 Family Size Boxes',
    icon: '🥣',
    isDepleted: false,
  },
  // Beverages
  {
    id: 'staple-coffee',
    name: 'Medium Roast Coffee Beans / Grounds',
    category: 'beverages',
    defaultQuantity: '1 Bag (12 oz)',
    icon: '☕',
    isDepleted: false,
  },
  {
    id: 'staple-oj',
    name: '100% Pure Orange Juice (No Pulp)',
    category: 'beverages',
    defaultQuantity: '1 Bottle (52 oz)',
    icon: '🍊',
    isDepleted: false,
  },
  // Household
  {
    id: 'staple-paper-towels',
    name: 'Ultra Absorbent Paper Towels',
    category: 'household',
    defaultQuantity: '1 Multi-Pack (6 rolls)',
    icon: '🧻',
    isDepleted: true, // depleted for demo
    depletedAt: getTodayDateString(),
    depletedBy: 'Dad',
    notes: 'Last roll on the counter holder',
  },
  {
    id: 'staple-trash-bags',
    name: '13-Gallon Kitchen Trash Bags',
    category: 'household',
    defaultQuantity: '1 Box (45 count)',
    icon: '🗑️',
    isDepleted: false,
  },
  {
    id: 'staple-dish-soap',
    name: 'Liquid Dish Soap / Dishwasher Pods',
    category: 'household',
    defaultQuantity: '1 Large Refill Bottle',
    icon: '🧼',
    isDepleted: false,
  },
  // Snacks
  {
    id: 'staple-fruit-snacks',
    name: 'Kids Organic Fruit Snacks',
    category: 'snacks',
    defaultQuantity: '1 Variety Box (24 ct)',
    icon: '🍓',
    isDepleted: true,
    depletedAt: getTodayDateString(),
    depletedBy: 'Sammy 🚀',
    notes: 'Lunchbox snacks depleted',
  },
];

/**
 * Initial Seed Grocery List
 */
export const DEFAULT_WEEKLY_GROCERY_LIST: WeeklyGroceryList = {
  title: 'Weekly Family Groceries',
  weekStartDate: getTodayDateString(),
  lastUpdated: new Date().toISOString(),
  pantryStaples: DEFAULT_PANTRY_STAPLES,
  items: [
    {
      id: 'g-item-1',
      name: 'Whole Milk (Gallon)',
      category: 'dairy_eggs',
      quantity: '1 Gallon',
      acquired: false,
      addedBy: 'Replenished from Pantry',
      isReplenishItem: true,
      createdAt: getTodayDateString(),
    },
    {
      id: 'g-item-2',
      name: 'Large Grade A Eggs',
      category: 'dairy_eggs',
      quantity: '1 Dozen',
      acquired: false,
      addedBy: 'Replenished from Pantry',
      isReplenishItem: true,
      createdAt: getTodayDateString(),
    },
    {
      id: 'g-item-3',
      name: 'Fresh Organic Bananas',
      category: 'produce',
      quantity: '1 Bunch',
      acquired: false,
      addedBy: 'Maya 🦄',
      isReplenishItem: true,
      createdAt: getTodayDateString(),
    },
    {
      id: 'g-item-4',
      name: 'Lean Ground Beef (85/15)',
      category: 'meat_seafood',
      quantity: '1.5 lbs',
      acquired: false,
      addedBy: 'Auto from Taco Tuesday 🌮',
      sourceMealDay: 'tuesday',
      createdAt: getTodayDateString(),
    },
    {
      id: 'g-item-5',
      name: 'Soft Flour Tortillas & Taco Shells',
      category: 'bakery',
      quantity: '1 Pack',
      acquired: true,
      acquiredAt: new Date().toISOString(),
      addedBy: 'Auto from Taco Tuesday 🌮',
      sourceMealDay: 'tuesday',
      createdAt: getTodayDateString(),
    },
    {
      id: 'g-item-6',
      name: 'Ultra Absorbent Paper Towels',
      category: 'household',
      quantity: '6 Rolls',
      acquired: false,
      addedBy: 'Replenished from Pantry',
      isReplenishItem: true,
      createdAt: getTodayDateString(),
    },
    {
      id: 'g-item-7',
      name: 'Crisp Honeycrisp Apples',
      category: 'produce',
      quantity: '3 lbs bag',
      acquired: true,
      acquiredAt: new Date().toISOString(),
      addedBy: 'Mom',
      createdAt: getTodayDateString(),
    },
    {
      id: 'g-item-8',
      name: 'Kids Organic Fruit Snacks',
      category: 'snacks',
      quantity: '1 Variety Box',
      acquired: false,
      addedBy: 'Sammy 🚀',
      isReplenishItem: true,
      createdAt: getTodayDateString(),
    },
  ],
};

/**
 * Returns all pantry staple items currently marked as depleted
 */
export const getPantryDepletedItems = (groceryList: WeeklyGroceryList): PantryStapleItem[] => {
  const staples = groceryList.pantryStaples || DEFAULT_PANTRY_STAPLES;
  return staples.filter((s) => s.isDepleted);
};

/**
 * Imports all depleted pantry items into the active grocery list (avoiding duplicate names)
 */
export const importDepletedItemsToGroceryList = (
  currentList: WeeklyGroceryList,
  customDepleted?: PantryStapleItem[]
): { updatedList: WeeklyGroceryList; importedCount: number } => {
  const staplesToImport = customDepleted || getPantryDepletedItems(currentList);
  const existingNames = new Set(
    (currentList.items || []).map((item) => item.name.toLowerCase().trim())
  );

  const newItems: GroceryItem[] = [];

  staplesToImport.forEach((staple) => {
    // Check if not already in active list
    if (!existingNames.has(staple.name.toLowerCase().trim())) {
      newItems.push({
        id: `g-rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: staple.name,
        category: staple.category,
        quantity: staple.defaultQuantity || '1',
        acquired: false,
        addedBy: staple.depletedBy ? `Replenish (${staple.depletedBy})` : 'Pantry Replenishment',
        notes: staple.notes,
        isReplenishItem: true,
        createdAt: getTodayDateString(),
      });
      existingNames.add(staple.name.toLowerCase().trim());
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
        quantity: staple.defaultQuantity || '1',
        acquired: false,
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
