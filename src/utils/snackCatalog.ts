import { GroceryImportance, AppSettings } from '../types';

export interface SnackCatalogItem {
  id: string;
  name: string;
  category: 'healthy' | 'munchies' | 'treats' | 'luxury';
  importance: GroceryImportance;
  icon: string;
  defaultQuantity: string;
  defaultStarCost: number;
  description: string;
}

export const DEFAULT_SNACK_STAR_TIERS: Record<GroceryImportance, number> = {
  staple: 5,
  common: 12,
  treat: 20,
  luxury: 35,
};

export function getStarCostForImportance(importance: GroceryImportance, settings?: AppSettings): number {
  if (settings?.snackStarTiers && typeof settings.snackStarTiers[importance] === 'number') {
    return settings.snackStarTiers[importance];
  }
  return DEFAULT_SNACK_STAR_TIERS[importance] || 15;
}

export function getSnackItemStarCost(item: SnackCatalogItem, settings?: AppSettings): number {
  if (settings?.customSnackStarOverrides && typeof settings.customSnackStarOverrides[item.id] === 'number') {
    return settings.customSnackStarOverrides[item.id];
  }
  if (settings?.snackStarTiers && typeof settings.snackStarTiers[item.importance] === 'number') {
    return settings.snackStarTiers[item.importance];
  }
  return item.defaultStarCost ?? DEFAULT_SNACK_STAR_TIERS[item.importance] ?? 10;
}

export const CURATED_SNACK_CATALOG: SnackCatalogItem[] = [
  // Healthy & Fresh Snacks (Staple Tier - 5 to 8 ⭐)
  {
    id: 'snack-berries',
    name: 'Fresh Strawberries & Blueberries',
    category: 'healthy',
    importance: 'staple',
    icon: '🍓',
    defaultQuantity: '1 container',
    defaultStarCost: 8,
    description: 'Sweet, juicy organic berries for snacking or breakfast.',
  },
  {
    id: 'snack-carrots-ranch',
    name: 'Baby Carrots & Ranch Dip',
    category: 'healthy',
    importance: 'staple',
    icon: '🥕',
    defaultQuantity: '1 bag & dip',
    defaultStarCost: 5,
    description: 'Crisp, crunchy baby carrots with delicious dipping sauce.',
  },
  {
    id: 'snack-bananas',
    name: 'Fresh Ripe Bananas',
    category: 'healthy',
    importance: 'staple',
    icon: '🍌',
    defaultQuantity: '1 bunch',
    defaultStarCost: 5,
    description: 'Potassium-packed sweet bananas ready to peel and eat.',
  },
  {
    id: 'snack-string-cheese',
    name: 'String Cheese (12-Pack)',
    category: 'healthy',
    importance: 'staple',
    icon: '🧀',
    defaultQuantity: '1 pack (12 sticks)',
    defaultStarCost: 8,
    description: 'Fun peelable mozzarella cheese sticks for afternoon fuel.',
  },
  {
    id: 'snack-yogurt-pouches',
    name: 'Fruit Yogurt Pouches',
    category: 'healthy',
    importance: 'staple',
    icon: '🥣',
    defaultQuantity: '1 box (4 pouches)',
    defaultStarCost: 8,
    description: 'Creamy berry & vanilla yogurt pouches without mess.',
  },
  {
    id: 'snack-apples-pb',
    name: 'Apple Slices & Peanut Butter',
    category: 'healthy',
    importance: 'staple',
    icon: '🍏',
    defaultQuantity: '1 bag & jar',
    defaultStarCost: 6,
    description: 'Crisp green apple slices with creamy peanut butter dip.',
  },
  {
    id: 'snack-green-grapes',
    name: 'Cotton Candy / Green Grapes',
    category: 'healthy',
    importance: 'staple',
    icon: '🍇',
    defaultQuantity: '1 bag (2 lbs)',
    defaultStarCost: 8,
    description: 'Extra sweet, seedless chilled grapes.',
  },

  // Everyday Munchies & Savory Snacks (Common Tier - 12 to 15 ⭐)
  {
    id: 'snack-goldfish',
    name: 'Goldfish Cheddar Crackers',
    category: 'munchies',
    importance: 'common',
    icon: '🐟',
    defaultQuantity: '1 large carton',
    defaultStarCost: 12,
    description: 'The classic baked cheddar snack that smiles back.',
  },
  {
    id: 'snack-cheez-it',
    name: "Cheez-It Snap'd or Grooves",
    category: 'munchies',
    importance: 'common',
    icon: '🧀',
    defaultQuantity: '1 family bag',
    defaultStarCost: 12,
    description: 'Super-cheesy, thin and crispy baked crackers.',
  },
  {
    id: 'snack-pretzels-hummus',
    name: 'Pretzel Crisps & Roasted Hummus',
    category: 'munchies',
    importance: 'common',
    icon: '🥨',
    defaultQuantity: '1 bag & tub',
    defaultStarCost: 14,
    description: 'Flat pretzel crisps with garlic or traditional hummus.',
  },
  {
    id: 'snack-butter-popcorn',
    name: 'Movie Theater Butter Popcorn',
    category: 'munchies',
    importance: 'common',
    icon: '🍿',
    defaultQuantity: '1 box (6 bags)',
    defaultStarCost: 12,
    description: 'Warm, buttery microwave popcorn for movie nights.',
  },
  {
    id: 'snack-potato-chips',
    name: 'Classic Potato Chips / Doritos',
    category: 'munchies',
    importance: 'common',
    icon: '🥔',
    defaultQuantity: '1 family bag',
    defaultStarCost: 12,
    description: 'Crunchy flavored chips for lunchboxes or weekend fun.',
  },
  {
    id: 'snack-juice-boxes',
    name: '100% Fruit Juice Boxes',
    category: 'munchies',
    importance: 'common',
    icon: '🧃',
    defaultQuantity: '1 pack (10 boxes)',
    defaultStarCost: 15,
    description: 'Apple or fruit punch juice boxes with no added sugar.',
  },
  {
    id: 'snack-granola-bars',
    name: 'Chewy Choc Chip Granola Bars',
    category: 'munchies',
    importance: 'common',
    icon: '🌾',
    defaultQuantity: '1 box (8 bars)',
    defaultStarCost: 10,
    description: 'Rolled oat bars packed with mini chocolate chips.',
  },

  // Sweet Treats & Specialty Goodies (Treat Tier - 18 to 25 ⭐)
  {
    id: 'snack-ice-cream-tub',
    name: 'Ice Cream Tub (Favorite Flavor)',
    category: 'treats',
    importance: 'treat',
    icon: '🍦',
    defaultQuantity: '1 tub (1.5 qt)',
    defaultStarCost: 20,
    description: 'Rich cookie dough, chocolate fudge, or vanilla bean.',
  },
  {
    id: 'snack-bakery-cookies',
    name: 'Bakery Chocolate Chip Cookies',
    category: 'treats',
    importance: 'treat',
    icon: '🍪',
    defaultQuantity: '1 bakery box (12 ct)',
    defaultStarCost: 18,
    description: 'Soft-baked fresh supermarket cookies with melting chips.',
  },
  {
    id: 'snack-sour-gummies',
    name: 'Sour Patch Kids / Gummy Candy',
    category: 'treats',
    importance: 'treat',
    icon: '🍬',
    defaultQuantity: '1 sharing size bag',
    defaultStarCost: 15,
    description: 'Sour then sweet chewy gummy candy.',
  },
  {
    id: 'snack-soda-pack',
    name: 'Soda or Sparkling Lemonade',
    category: 'treats',
    importance: 'treat',
    icon: '🥤',
    defaultQuantity: '1 pack (6 cans/bottles)',
    defaultStarCost: 20,
    description: 'Chilled soda, root beer, or berry sparkling water.',
  },
  {
    id: 'snack-chocolate-bars',
    name: 'Full-Size Chocolate Candy Bars',
    category: 'treats',
    importance: 'treat',
    icon: '🍫',
    defaultQuantity: '2 full-size bars',
    defaultStarCost: 18,
    description: "Kid's choice of Hershey's, Kit Kat, or Reese's.",
  },
  {
    id: 'snack-popsicles',
    name: 'Fruit Popsicles / Ice Cream Bars',
    category: 'treats',
    importance: 'treat',
    icon: '🍧',
    defaultQuantity: '1 box (6 bars)',
    defaultStarCost: 20,
    description: 'Refreshing frozen fruit bars or chocolate fudge pops.',
  },
  {
    id: 'snack-donuts',
    name: 'Fresh Glazed or Sprinkled Donuts',
    category: 'treats',
    importance: 'treat',
    icon: '🍩',
    defaultQuantity: '1 box (4-6 donuts)',
    defaultStarCost: 22,
    description: 'Supermarket bakery donuts for a special weekend morning.',
  },

  // Luxury & Gourmet Treats (Luxury Tier - 35 to 45 ⭐)
  {
    id: 'snack-beef-jerky',
    name: 'Gourmet Beef Jerky / Meat Sticks',
    category: 'luxury',
    importance: 'luxury',
    icon: '🥩',
    defaultQuantity: '1 large bag (8 oz)',
    defaultStarCost: 35,
    description: 'Premium slow-smoked tender beef jerky.',
  },
  {
    id: 'snack-gelato-pint',
    name: 'Artisan Gelato / Haagen-Dazs Pint',
    category: 'luxury',
    importance: 'luxury',
    icon: '🍨',
    defaultQuantity: '1 pint',
    defaultStarCost: 35,
    description: 'High-end gourmet gelato or custard dessert pint.',
  },
  {
    id: 'snack-starbucks-frapp',
    name: 'Bottled Frappuccino 4-Pack',
    category: 'luxury',
    importance: 'luxury',
    icon: '🧋',
    defaultQuantity: '1 4-pack glass bottles',
    defaultStarCost: 40,
    description: 'Chilled mocha or vanilla coffee refresher drink.',
  },
  {
    id: 'snack-imported-choc',
    name: 'Specialty Belgian / Swiss Chocolates',
    category: 'luxury',
    importance: 'luxury',
    icon: '👑',
    defaultQuantity: '1 gift box',
    defaultStarCost: 40,
    description: 'Premium rich European chocolates or Lindt truffles.',
  },
  {
    id: 'snack-snack-pizza',
    name: 'Personal Stuffed Crust Pizza Box',
    category: 'luxury',
    importance: 'luxury',
    icon: '🍕',
    defaultQuantity: '1 box (2 pizzas)',
    defaultStarCost: 35,
    description: 'Special frozen snack pizza with cheese-stuffed crust.',
  },
  {
    id: 'snack-bakery-cake',
    name: 'Mini Bakery Celebration Cake',
    category: 'luxury',
    importance: 'luxury',
    icon: '🎂',
    defaultQuantity: '1 small cake',
    defaultStarCost: 45,
    description: 'Fresh bakery frosted cake for high-achieving weeks.',
  },
];
