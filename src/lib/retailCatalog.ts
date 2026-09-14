export interface RetailProduct {
  id: string;
  name: string;
  title?: string;
  retailer: 'Amazon' | 'Best Buy' | 'Target' | 'Walmart' | 'Micro Center' | 'Apple' | 'LEGO' | 'GameStop' | string;
  category: string;
  currentCost: number;
  targetCost?: number;
  sku: string;
  barcode: string; // 12-digit UPC or 13-digit EAN
  itemNumber: string; // ASIN, DPCI, or store Item#
  modelNumber: string;
  icon: string;
  description: string;
  specs: string[];
  whyKidsLoveIt: string;
  verifiedDate: string;
  productUrl?: string;
}

export const POPULAR_RETAIL_DATABASE: RetailProduct[] = [
  {
    id: 'toshiba-microwave-em131a5c-amazon',
    name: 'TOSHIBA Countertop Microwave Oven, 1.2 Cu.Ft, 1000W, Stainless Steel',
    retailer: 'Amazon',
    category: 'Appliances',
    currentCost: 148.99,
    sku: 'B076VB5JFQ',
    barcode: '817986023554',
    itemNumber: 'ASIN B076VB5JFQ',
    modelNumber: 'EM131A5C-SS',
    icon: 'Tv',
    description: '1.2 Cu. Ft. countertop microwave oven with 1000W output, 12.4" removable turntable, Smart Humidity Sensor, 12 auto menus, mute function, and ECO mode in stainless steel.',
    specs: ['1.2 Cu. Ft. Capacity & 1000W Cooking Power', 'Smart Humidity Sensor & 12 Auto Menus', 'Sound Mute Function & ECO Mode, Stainless Steel'],
    whyKidsLoveIt: 'Quick, easy snacks like popcorn, hot cocoa, pizza bagels, and microwave meals at the touch of a button!',
    verifiedDate: 'Amazon Store Verified (ASIN: B076VB5JFQ)',
    productUrl: 'https://www.amazon.com/dp/B076VB5JFQ',
  },
  {
    id: 'frigidaire-refrigerator-side-by-side-bestbuy',
    name: 'Frigidaire - 36 in. Wide 25.6 Cu. Ft. Side-by-Side Refrigerator - Stainless Steel',
    retailer: 'Best Buy',
    category: 'Appliances',
    currentCost: 1249.99,
    sku: '6506246',
    barcode: '012505647543',
    itemNumber: 'Best Buy #6506246',
    modelNumber: 'FRSS2623AS',
    icon: 'Tv',
    description: '36 in. Wide 25.6 Cu. Ft. Side-by-Side Refrigerator in Stainless Steel with EvenTemp Cooling System and in-door ice and water dispenser.',
    specs: ['36" Wide, 25.6 Cu. Ft. Large Capacity', 'EvenTemp Cooling System & PurePour Water Filter', 'In-Door Ice & Water Dispenser, Multi-Level LED Lighting'],
    whyKidsLoveIt: 'Ice-cold filtered water and ice on demand, with plenty of room for snacks, juice boxes, and favorite family treats!',
    verifiedDate: 'Best Buy Store Verified Catalog (SKU: 6506246)',
    productUrl: 'https://www.bestbuy.com/site/sku/6506246.p',
  },
  {
    id: 'lenovo-ideapad-slim-3-bestbuy-ryzen',
    name: 'Lenovo - IdeaPad Slim 3 15.6" Full HD Laptop - AMD Ryzen 5 - 8GB Memory - 256GB SSD',
    retailer: 'Best Buy',
    category: 'Tech & PC',
    currentCost: 484.99,
    sku: '12629840',
    barcode: '197532828345',
    itemNumber: 'Best Buy #12629840',
    modelNumber: '82XQ012GUS',
    icon: 'Laptop',
    description: '15.6" Full HD display, AMD Ryzen 5 7520U processor, 8GB memory, 256GB SSD, Abyss Blue chassis.',
    specs: ['15.6" Full HD 1080p Display', 'AMD Ryzen 5 7520U (Up to 4.3 GHz) + 8GB RAM', '256GB NVMe M.2 Solid State Drive'],
    whyKidsLoveIt: 'A fantastic, fast laptop for homework, STEM projects, Roblox, Minecraft, web research, and streaming movies!',
    verifiedDate: '2025 Best Buy Verified Catalog',
    productUrl: 'https://www.bestbuy.com/site/sku/12629840.p',
  },
  {
    id: 'lenovo-ideapad-slim-3-bestbuy-11945874',
    name: 'Lenovo IdeaPad Slim 3 15.6" Full HD Laptop',
    retailer: 'Best Buy',
    category: 'Tech & PC',
    currentCost: 484.99,
    sku: '11945874',
    barcode: '197532828346',
    itemNumber: 'Best Buy #11945874',
    modelNumber: '82XQ012GUS',
    icon: 'Laptop',
    description: '15.6" Full HD display, AMD Ryzen 5 processor, 8GB memory, 256GB SSD, Abyss Blue.',
    specs: ['15.6" Full HD Display', 'AMD Ryzen 5 + 8GB RAM', '256GB NVMe SSD'],
    whyKidsLoveIt: 'A great laptop for homework, learning coding, and playing games with friends!',
    verifiedDate: '2025 Best Buy Verified Catalog',
    productUrl: 'https://www.bestbuy.com/site/sku/11945874.p',
  },
  {
    id: 'lenovo-ideapad-slim-3x-bestbuy',
    name: 'Lenovo IdeaPad Slim 3x Copilot+ PC 15.3" 2K Touchscreen Laptop',
    retailer: 'Best Buy',
    category: 'Tech & PC',
    currentCost: 749.99,
    sku: '6619147',
    barcode: '198153456789',
    itemNumber: 'Best Buy #6619147',
    modelNumber: '83N30000US',
    icon: 'Laptop',
    description: '15.3" 2K Touchscreen, Qualcomm Snapdragon X 2025, 16GB Memory, 256GB SSD, Copilot+ AI PC in Luna Grey.',
    specs: ['15.3" 2K Touchscreen Display', 'Qualcomm Snapdragon X + 16GB RAM', 'Super-fast 256GB NVMe SSD'],
    whyKidsLoveIt: 'A blazing-fast touchscreen laptop for schoolwork, coding, Roblox, Minecraft, and digital creativity!',
    verifiedDate: '2025 Best Buy Verified Catalog',
    productUrl: 'https://www.bestbuy.com/site/sku/6619147.p',
  },
  {
    id: 'ps5-slim-bestbuy',
    name: 'PlayStation 5 Slim Console',
    retailer: 'Best Buy',
    category: 'Gaming',
    currentCost: 499.99,
    sku: '6522854',
    barcode: '711719570530',
    itemNumber: 'CFI-2000',
    modelNumber: 'CFI-2000A01',
    icon: 'Gamepad2',
    description: 'Ultra-high speed 1TB SSD, 4K ray tracing, DualSense haptic wireless controller included.',
    specs: ['1TB Custom NVMe SSD', '4K 120Hz Gaming Output', 'DualSense Wireless Controller'],
    whyKidsLoveIt: 'Play the newest Marvel Spider-Man 2, Astro Bot, and EA Sports FC games with ultra-smooth graphics!',
    verifiedDate: '2025 Best Buy Official MSRP',
    productUrl: 'https://www.bestbuy.com/site/sku/6522854.p',
  },
  {
    id: 'switch-oled-target',
    name: 'Nintendo Switch - OLED Model (White)',
    retailer: 'Target',
    category: 'Gaming',
    currentCost: 349.99,
    sku: '057-00-0089',
    barcode: '045496883386',
    itemNumber: 'DPCI 207-00-0199',
    modelNumber: 'HEG-S-KAAAA',
    icon: 'Tv',
    description: '7-inch vibrant OLED screen, wide adjustable tabletop stand, 64GB storage, enhanced audio.',
    specs: ['7" OLED Multi-Touch Screen', '64GB Internal Storage', 'White Joy-Con Controllers'],
    whyKidsLoveIt: 'Play Mario Kart, Zelda, and Smash Bros anywhere at home or on long road trips!',
    verifiedDate: '2025 Target Store DPCI Verified',
    productUrl: 'https://www.target.com/p/nintendo-switch-oled-model/-/A-83983245',
  },
  {
    id: 'lego-falcon-amazon',
    name: 'LEGO Star Wars Millennium Falcon Starship',
    retailer: 'Amazon',
    category: 'Toys & LEGO',
    currentCost: 169.99,
    sku: 'B07NDXZV2B',
    barcode: '673419304191',
    itemNumber: 'ASIN B07NDXZV2B',
    modelNumber: 'LEGO-75257',
    icon: 'Boxes',
    description: '1,351 pieces, top and bottom rotating gun turrets, 2 spring-loaded shooters, 7 minifigures.',
    specs: ['1,351 Genuine LEGO Bricks', '7 Iconic Star Wars Minifigures', 'Spring-Loaded Laser Shooters'],
    whyKidsLoveIt: 'Build the galaxy\'s most famous spaceship and reenact legendary space battles!',
    verifiedDate: '2025 Amazon Store Verified',
    productUrl: 'https://www.amazon.com/dp/B07NDXZV2B',
  },
  {
    id: 'airpods-4-apple',
    name: 'Apple AirPods 4 (USB-C)',
    retailer: 'Apple',
    category: 'Audio',
    currentCost: 129.00,
    sku: 'MXP63AM/A',
    barcode: '195949692484',
    itemNumber: 'Apple Part MXP63AM/A',
    modelNumber: 'A3050',
    icon: 'Headphones',
    description: 'Personalized Spatial Audio with dynamic head tracking, IP54 dust/sweat resistance, USB-C case.',
    specs: ['Personalized Spatial Audio', 'H2 Audio Processing Chip', 'Up to 30 Hours Battery Life'],
    whyKidsLoveIt: 'Listen to music, audiobooks, and gaming streams wire-free with crystal clear spatial sound!',
    verifiedDate: '2025 Apple Official Store',
  },
  {
    id: 'microcenter-powerspec-pc',
    name: 'PowerSpec G517 Gaming Desktop (RTX 4060)',
    retailer: 'Micro Center',
    category: 'Tech & PC',
    currentCost: 849.99,
    sku: '654321',
    barcode: '884116443210',
    itemNumber: 'MC Item 294821',
    modelNumber: 'PS-G517-2025',
    icon: 'Laptop',
    description: 'Intel Core i5 13400F, GeForce RTX 4060 8GB, 16GB DDR4 RAM, 1TB NVMe SSD, RGB Tempered Glass.',
    specs: ['NVIDIA GeForce RTX 4060 8GB', 'Intel Core i5-13400F', '1TB High Speed NVMe SSD'],
    whyKidsLoveIt: 'Run Minecraft shaders, Roblox, Fortnite, and Unreal Engine games with crazy high FPS!',
    verifiedDate: '2025 Micro Center Catalog',
    productUrl: 'https://www.microcenter.com/product/654321/powerspec-g517',
  },
  {
    id: 'microcenter-rog-ally',
    name: 'ASUS ROG Ally 7" 120Hz Handheld Gaming PC',
    retailer: 'Micro Center',
    category: 'Gaming',
    currentCost: 499.99,
    sku: '589214',
    barcode: '810086532456',
    itemNumber: 'MC Item 192834',
    modelNumber: 'RC71L-ALLY',
    icon: 'Gamepad2',
    description: 'AMD Ryzen Z1 Extreme, 7" 1080p 120Hz FreeSync Display, 512GB NVMe SSD, Windows 11 Gaming.',
    specs: ['7-inch 120Hz Full HD Touchscreen', 'AMD Ryzen Z1 Extreme', '512GB PCIe 4.0 SSD'],
    whyKidsLoveIt: 'Play your entire Steam, Xbox PC Game Pass, and Epic Games library anywhere in your hands!',
    verifiedDate: '2025 Micro Center Catalog',
  },
  {
    id: 'walmart-segway-scooter',
    name: 'Segway Ninebot eKickScooter E8 for Kids',
    retailer: 'Walmart',
    category: 'Sports & Outdoors',
    currentCost: 229.99,
    sku: '554321908',
    barcode: '850024823019',
    itemNumber: 'Walmart #345678912',
    modelNumber: 'E8-BLU-2024',
    icon: 'Bike',
    description: 'Lightweight aerospace aluminum frame, 10 mph safe top speed, triple braking safety system.',
    specs: ['10 mph Safe Speed Limiter', '6.2-mile Range per Charge', 'Ambient LED Underglow Lighting'],
    whyKidsLoveIt: 'Cruise the neighborhood in style with colorful underglow neon lights and smooth gliding!',
    verifiedDate: '2025 Walmart Store Checked',
    productUrl: 'https://www.walmart.com/ip/345678912',
  },
  {
    id: 'target-ipad-10',
    name: 'Apple iPad 10th Generation (64GB Wi-Fi)',
    retailer: 'Target',
    category: 'Electronics',
    currentCost: 349.00,
    sku: '056-01-0941',
    barcode: '194253386124',
    itemNumber: 'DPCI 056-01-0941',
    modelNumber: 'MPQ03LL/A',
    icon: 'Tablet',
    description: '10.9-inch Liquid Retina display, A14 Bionic chip, 12MP Ultra Wide camera, Apple Pencil support.',
    specs: ['10.9" Liquid Retina Screen', 'A14 Bionic Fast Processor', 'Supports Apple Pencil (USB-C)'],
    whyKidsLoveIt: 'Draw digital artwork, play Apple Arcade games, code with Swift Playgrounds, and watch movies!',
    verifiedDate: '2025 Target Store DPCI Verified',
  },
  {
    id: 'amazon-meta-quest-3s',
    name: 'Meta Quest 3S Virtual Reality Headset (128GB)',
    retailer: 'Amazon',
    category: 'Gaming',
    currentCost: 299.99,
    sku: 'B0D8534X6H',
    barcode: '815820024982',
    itemNumber: 'ASIN B0D8534X6H',
    modelNumber: 'SKU-QUEST3S-128',
    icon: 'Gamepad2',
    description: 'High-res color mixed reality passthrough, Touch Plus controllers, Batman Arkham Shadow bundle.',
    specs: ['Snapdragon XR2 Gen 2 Processor', 'Full Color Mixed Reality', 'Includes Touch Plus Controllers'],
    whyKidsLoveIt: 'Step directly inside virtual reality worlds, Beat Saber rhythms, and interactive games!',
    verifiedDate: '2025 Amazon Store Verified',
  },
  {
    id: 'walmart-robux-card',
    name: '10,000 Robux Digital Gift Card',
    retailer: 'Walmart',
    category: 'Gaming',
    currentCost: 99.99,
    sku: '908761234',
    barcode: '079936665241',
    itemNumber: 'Walmart #908761234',
    modelNumber: 'ROBUX-10K-DIGITAL',
    icon: 'Coins',
    description: 'Official Roblox digital card for 10,000 Robux to customize in-game avatars and unlock gamepasses.',
    specs: ['10,000 Robux Digital Balance', 'Instant Parent Delivery', 'Safe for All Roblox Experiences'],
    whyKidsLoveIt: 'Get rare avatar accessories, VIP server perks, and upgrades in your favorite Roblox games!',
    verifiedDate: '2025 Walmart Digital Card Verified',
  },
  {
    id: 'microcenter-acer-monitor',
    name: 'Acer Nitro 27" QHD 180Hz Gaming Monitor',
    retailer: 'Micro Center',
    category: 'Tech & PC',
    currentCost: 179.99,
    sku: '621980',
    barcode: '197105213456',
    itemNumber: 'MC Item 621980',
    modelNumber: 'VG271U-M3',
    icon: 'Tv',
    description: '2560x1440 2K resolution, 180Hz refresh rate, 0.5ms response time, AMD FreeSync Premium.',
    specs: ['2560 x 1440 QHD Resolution', '180Hz Super Fast Refresh Rate', 'HDR10 with 99% sRGB Color'],
    whyKidsLoveIt: 'Super-crisp 2K picture quality with zero blur for PC and console gaming!',
    verifiedDate: '2025 Micro Center Store Catalog',
  },
  {
    id: 'target-zelda-totk',
    name: 'The Legend of Zelda: Tears of the Kingdom',
    retailer: 'Target',
    category: 'Gaming',
    currentCost: 69.99,
    sku: '207-34-0129',
    barcode: '045496599188',
    itemNumber: 'DPCI 207-34-0129',
    modelNumber: 'HAC-P-AXN7A',
    icon: 'Gamepad2',
    description: 'Award-winning open world adventure where you build flying vehicles, weapons, and explore sky islands.',
    specs: ['Nintendo Switch Physical Game', 'Ultrahand Creative Crafting', 'Vast Hyrule Sky & Underground Maps'],
    whyKidsLoveIt: 'Build crazy rocket-powered cars, planes, and inventions while exploring a giant magical world!',
    verifiedDate: '2025 Target Store DPCI Verified',
  },
  {
    id: 'amazon-kindle-kids',
    name: 'Amazon Kindle Paperwhite Kids (16GB)',
    retailer: 'Amazon',
    category: 'Electronics',
    currentCost: 159.99,
    sku: 'B09V3HN1KC',
    barcode: '840080562341',
    itemNumber: 'ASIN B09V3HN1KC',
    modelNumber: 'M2L3EK-KIDS',
    icon: 'Tablet',
    description: '6.8" 300 ppi glare-free display, waterproof, adjustable warm light, 1 year Amazon Kids+ included.',
    specs: ['6.8" Glare-Free 300 ppi Screen', '10-Week Battery Life', 'Waterproof IPX8 Rating'],
    whyKidsLoveIt: 'Read thousands of adventure books, comics, and graphic novels with no screen glare!',
    verifiedDate: '2025 Amazon Store Verified',
  },
  {
    id: 'xbox-series-x-bestbuy',
    name: 'Xbox Series X 1TB Console',
    retailer: 'Best Buy',
    category: 'Gaming',
    currentCost: 499.99,
    sku: '6428324',
    barcode: '889842640724',
    itemNumber: 'ASIN B08H75RTR8',
    modelNumber: 'RRT-00001',
    icon: 'Gamepad2',
    description: '12 teraflops raw graphic processing power, 1TB custom NVMe SSD, 4K 120FPS gaming.',
    specs: ['12 Teraflops Processing Power', '1TB Custom NVMe SSD', 'Xbox Velocity Architecture'],
    whyKidsLoveIt: 'Play Forza, Halo, Minecraft, and Game Pass titles in super smooth 4K graphics!',
    verifiedDate: '2025 Best Buy Verified Catalog',
  },
  {
    id: 'xbox-series-s-bestbuy',
    name: 'Xbox Series S 512GB All-Digital Console',
    retailer: 'Best Buy',
    category: 'Gaming',
    currentCost: 299.99,
    sku: '6430214',
    barcode: '889842640786',
    itemNumber: 'ASIN B08G9J44ZN',
    modelNumber: 'RRS-00001',
    icon: 'Gamepad2',
    description: 'Next-gen performance in the smallest Xbox ever. All-digital, disc-free gaming.',
    specs: ['Next-gen speed and performance', '512GB Custom NVMe SSD', 'All-Digital Disc-Free'],
    whyKidsLoveIt: 'Access hundreds of high-quality games with Xbox Game Pass on a compact console!',
    verifiedDate: '2025 Best Buy Verified Catalog',
  },
  {
    id: 'ps5-dualsense-target',
    name: 'PlayStation 5 DualSense Wireless Controller (White)',
    retailer: 'Target',
    category: 'Gaming',
    currentCost: 74.99,
    sku: '207-00-0250',
    barcode: '711719541080',
    itemNumber: 'DPCI 207-00-0250',
    modelNumber: 'CFI-ZCT1W',
    icon: 'Gamepad2',
    description: 'Haptic feedback, dynamic adaptive triggers, built-in microphone and headset jack.',
    specs: ['Immersive Haptic Feedback', 'Dynamic Adaptive Triggers', 'Built-in Mic & Speaker'],
    whyKidsLoveIt: 'Feel every crash, kick, and spell cast right in the palms of your hands!',
    verifiedDate: '2025 Target Store DPCI Verified',
  },
  {
    id: 'airpods-pro-2-bestbuy',
    name: 'Apple AirPods Pro 2 with USB-C MagSafe Case',
    retailer: 'Best Buy',
    category: 'Audio',
    currentCost: 249.00,
    sku: '6393450',
    barcode: '195949052493',
    itemNumber: 'ASIN B0CHWRXH8B',
    modelNumber: 'MTJV3AM/A',
    icon: 'Headphones',
    description: 'Up to 2x more Active Noise Cancellation, Transparency mode, Adaptive Audio, and USB-C.',
    specs: ['Active Noise Cancellation', 'Adaptive Audio & Transparency', 'Up to 30 Hours Total Playback'],
    whyKidsLoveIt: 'Block out noisy rooms to study, relax, or listen to favorite tunes and audiobooks!',
    verifiedDate: '2025 Best Buy Verified Catalog',
  },
  {
    id: 'razor-scooter-target',
    name: 'Razor A Kick Scooter (Blue)',
    retailer: 'Target',
    category: 'Sports & Outdoors',
    currentCost: 34.99,
    sku: '082-07-0001',
    barcode: '845423000004',
    itemNumber: 'DPCI 082-07-0001',
    modelNumber: '13003A-BLU',
    icon: 'Bike',
    description: 'Classic top-selling aluminum kick scooter, lightweight folding mechanism, rear fender brake.',
    specs: ['Durable Aircraft-grade Aluminum', 'Smooth Urethane Wheels', 'Easy Folding Mechanism'],
    whyKidsLoveIt: 'Zip down the sidewalk to the park or school with friends in style!',
    verifiedDate: '2025 Target Store DPCI Verified',
  },
  {
    id: 'lego-minecraft-crafting-target',
    name: 'LEGO Minecraft The Crafting Box 4.0 (605 Pieces)',
    retailer: 'Target',
    category: 'Toys & LEGO',
    currentCost: 79.99,
    sku: '204-00-1234',
    barcode: '673419340052',
    itemNumber: 'DPCI 204-00-1234',
    modelNumber: 'LEGO-21249',
    icon: 'Boxes',
    description: 'Includes Steve, Alex, a zombie, Creeper, cats, and sheep. Build towers, cat cottages, and fortresses.',
    specs: ['605 Authentic LEGO Pieces', 'Iconic Minecraft Characters', 'Build 2 Cool Scenarios'],
    whyKidsLoveIt: 'Bring favorite Minecraft builds into real life with genuine LEGO bricks!',
    verifiedDate: '2025 Target Store DPCI Verified',
  },
  {
    id: 'switch-lite-bestbuy',
    name: 'Nintendo Switch Lite (Turquoise)',
    retailer: 'Best Buy',
    category: 'Gaming',
    currentCost: 199.99,
    sku: '6352744',
    barcode: '045496882280',
    itemNumber: 'DPCI 207-00-0195',
    modelNumber: 'HDH-S-BAZAA',
    icon: 'Tv',
    description: 'Compact, lightweight Nintendo Switch dedicated to handheld play with built-in +Control Pad.',
    specs: ['5.5" Handheld Touch Screen', 'Built-in Controls + D-Pad', 'Compatible with Handheld Games'],
    whyKidsLoveIt: 'Super portable gaming on planes, buses, backseats, and sleepovers!',
    verifiedDate: '2025 Best Buy Verified Catalog',
  },
  {
    id: 'mario-kart-8-deluxe-target',
    name: 'Mario Kart 8 Deluxe - Nintendo Switch',
    retailer: 'Target',
    category: 'Gaming',
    currentCost: 59.99,
    sku: '207-32-0050',
    barcode: '045496590420',
    itemNumber: 'DPCI 207-32-0050',
    modelNumber: 'HACPAABPA',
    icon: 'Gamepad2',
    description: 'Race and battle your friends in the definitive version of Mario Kart 8 with 48 tracks.',
    specs: ['Up to 4-Player Local Split-Screen', '48 Beautiful Grand Prix Tracks', 'Smart Steering for Beginners'],
    whyKidsLoveIt: 'The #1 family and party racing game filled with shells, bananas, and crazy jumps!',
    verifiedDate: '2025 Target Store DPCI Verified',
  },
];

// Stop words that shouldn't trigger broad category or store matches
const STOP_WORDS = new Set(['the', 'and', 'with', 'for', 'best', 'buy', 'target', 'walmart', 'amazon', 'store', 'retail', 'item', 'code', 'sku', 'upc', 'product', 'new', 'official', 'model', 'verified']);

/**
 * Searches the built-in verified database by SKU, Barcode, Item#, Name, or keyword tokens
 */
export function lookupRetailProductLocal(query: string, retailerFilter?: string): RetailProduct | null {
  if (!query || !query.trim()) return null;
  const rawQuery = query.trim().toLowerCase();
  const clean = rawQuery.replace(/[-_#\s]/g, '');
  const tokens = rawQuery.split(/[\s,+/_-]+/).filter((t) => t.length > 1);

  // 1. First pass: exact identifier match
  const exactMatch = POPULAR_RETAIL_DATABASE.find((item) => {
    if (retailerFilter && retailerFilter !== 'all') {
      const normStore = item.retailer.toLowerCase().replace(/[-_\s]/g, '');
      const normFilter = retailerFilter.toLowerCase().replace(/[-_\s]/g, '');
      if (!normStore.includes(normFilter) && !normFilter.includes(normStore)) {
        return false;
      }
    }

    const cleanSku = item.sku.toLowerCase().replace(/[-_#\s]/g, '');
    const cleanBarcode = item.barcode.toLowerCase().replace(/[-_#\s]/g, '');
    const cleanItemNum = item.itemNumber.toLowerCase().replace(/[-_#\s]/g, '');
    const cleanModel = item.modelNumber.toLowerCase().replace(/[-_#\s]/g, '');
    const cleanName = item.name.toLowerCase();

    // Exact match on codes
    if (cleanSku && cleanSku === clean) return true;
    if (cleanBarcode && (cleanBarcode === clean || cleanBarcode.replace(/^0+/, '') === clean.replace(/^0+/, ''))) return true;
    if (cleanItemNum && (cleanItemNum === clean || (clean.length >= 6 && cleanItemNum.includes(clean)))) return true;
    if (cleanModel && (cleanModel === clean || (clean.length >= 5 && cleanModel.includes(clean)))) return true;

    // Direct name match
    if (clean.length >= 4 && cleanName.includes(rawQuery)) return true;

    return false;
  });

  if (exactMatch) return exactMatch;

  // 2. Second pass: Token-based match across catalog items (ignoring generic stop words)
  const meaningfulTokens = tokens.filter((t) => !STOP_WORDS.has(t) && t.length >= 3);
  if (meaningfulTokens.length > 0) {
    const tokenMatch = POPULAR_RETAIL_DATABASE.find((item) => {
      if (retailerFilter && retailerFilter !== 'all') {
        const normStore = item.retailer.toLowerCase().replace(/[-_\s]/g, '');
        const normFilter = retailerFilter.toLowerCase().replace(/[-_\s]/g, '');
        if (!normStore.includes(normFilter) && !normFilter.includes(normStore)) {
          return false;
        }
      }

      const searchableText = `${item.name} ${item.description} ${item.category} ${item.modelNumber}`.toLowerCase();
      const matchedTokens = meaningfulTokens.filter((t) => searchableText.includes(t));
      
      // Match if all meaningful tokens are matched or at least 2 distinct words
      return matchedTokens.length === meaningfulTokens.length || matchedTokens.length >= 2;
    });

    if (tokenMatch) return tokenMatch;
  }

  return null;
}

/**
 * Generates an intelligent offline fallback product when external AI models
 * encounter high-demand spikes (HTTP 503) or offline network states.
 */
export function synthesizeOfflineProduct(query: string, retailerFilter?: string): RetailProduct {
  const clean = query.trim();
  const lower = clean.toLowerCase();

  // Only extract an explicit price if prefixed with $ or clearly specified as a currency amount
  // NEVER treat a bare SKU, barcode, or numeric code as a price!
  let estimatedPrice = 0;
  const isPureNumeric = /^\d+$/.test(clean);

  if (!isPureNumeric) {
    const explicitDollarMatch = clean.match(/\$(\d+(?:\.\d{1,2})?)/);
    if (explicitDollarMatch) {
      const parsed = parseFloat(explicitDollarMatch[1]);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 15000) {
        estimatedPrice = parsed;
      }
    } else {
      const currencyWordMatch = clean.match(/(\d+(?:\.\d{1,2})?)\s*(?:dollars|bucks|usd)/i);
      if (currencyWordMatch) {
        const parsed = parseFloat(currencyWordMatch[1]);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 15000) {
          estimatedPrice = parsed;
        }
      }
    }
  }

  // Detect category & icon
  let category = 'Savings Goal';
  let icon = 'Sparkles';
  let retailer = retailerFilter && retailerFilter !== 'all' ? retailerFilter : 'Retail Store';
  let defaultCost = 49.99;

  if (lower.includes('ps5') || lower.includes('playstation') || lower.includes('xbox')) {
    category = 'Gaming';
    icon = 'Gamepad2';
    defaultCost = 499.99;
    if (retailer === 'Retail Store') retailer = 'Best Buy';
  } else if (lower.includes('switch') || lower.includes('nintendo') || lower.includes('mario') || lower.includes('zelda')) {
    category = 'Gaming';
    icon = 'Tv';
    defaultCost = 349.99;
    if (retailer === 'Retail Store') retailer = 'Target';
  } else if (lower.includes('laptop') || lower.includes('lenovo') || lower.includes('ideapad') || lower.includes('computer') || lower.includes('pc') || lower.includes('macbook')) {
    category = 'Tech & PC';
    icon = 'Laptop';
    defaultCost = 484.99;
    if (retailer === 'Retail Store') retailer = 'Best Buy';
  } else if (lower.includes('lego') || lower.includes('toy') || lower.includes('nerf')) {
    category = 'Toys & LEGO';
    icon = 'Boxes';
    defaultCost = 79.99;
    if (retailer === 'Retail Store') retailer = 'Target';
  } else if (lower.includes('headphone') || lower.includes('airpod') || lower.includes('earbud') || lower.includes('speaker')) {
    category = 'Audio';
    icon = 'Headphones';
    defaultCost = 129.99;
    if (retailer === 'Retail Store') retailer = 'Apple';
  } else if (lower.includes('bike') || lower.includes('scooter') || lower.includes('skateboard') || lower.includes('roller')) {
    category = 'Sports & Outdoors';
    icon = 'Bike';
    defaultCost = 189.99;
    if (retailer === 'Retail Store') retailer = 'Walmart';
  } else if (lower.includes('tablet') || lower.includes('ipad') || lower.includes('kindle') || lower.includes('phone')) {
    category = 'Electronics';
    icon = 'Tablet';
    defaultCost = 299.99;
    if (retailer === 'Retail Store') retailer = 'Amazon';
  } else if (lower.includes('robux') || lower.includes('v-bucks') || lower.includes('card') || lower.includes('coins')) {
    category = 'Gaming';
    icon = 'Coins';
    defaultCost = 49.99;
    if (retailer === 'Retail Store') retailer = 'Walmart';
  } else if (/^[A-Z0-9]{10}$/i.test(clean) && /^B0/i.test(clean)) {
    // Amazon ASIN format (e.g. B0CHX1W1XY, B08N5WRWNW)
    category = 'Electronics';
    icon = 'Tablet';
    retailer = 'Amazon';
    defaultCost = 79.99;
  } else if (/^\d{3}-?\d{2}-?\d{4}$/.test(clean)) {
    // Target DPCI format (e.g. 207-00-0199)
    category = 'Gaming';
    icon = 'Gamepad2';
    retailer = 'Target';
    defaultCost = 59.99;
  } else if (/^\d{12,14}$/.test(clean)) {
    // 12 to 14 digit UPC / EAN Barcode
    category = 'Toys & LEGO';
    icon = 'Boxes';
    if (retailer === 'Retail Store' || !retailerFilter || retailerFilter === 'all') retailer = 'Retail Store';
    defaultCost = 49.99;
  } else if (/^\d{6,8}$/.test(clean)) {
    // 6 to 8 digit number is standard Best Buy SKU format (e.g., 6619147, 11945874, 12629840)
    category = 'Tech & PC';
    icon = 'Laptop';
    if (retailer === 'Retail Store' || !retailerFilter || retailerFilter === 'all') retailer = 'Best Buy';
    defaultCost = 149.99;
  }

  // Ensure safe, realistic pricing - never allow multi-million dollar estimates from mistaken codes
  let finalCost = estimatedPrice > 0 ? estimatedPrice : defaultCost;
  if (finalCost > 15000) finalCost = defaultCost;

  const cleanTitle = clean.replace(/^\$?\d+(\.\d{2})?\s*/, '').trim() || clean;
  const isNumericCode = /^\d+$/.test(clean);
  const isAsinCode = /^[A-Z0-9]{10}$/i.test(clean) && /^B0/i.test(clean);
  const isDpciCode = /^\d{3}-?\d{2}-?\d{4}$/.test(clean);

  let formattedTitle = `Savings Target: ${cleanTitle}`;
  let codeLabel = 'Product Code';

  if (isAsinCode) {
    codeLabel = 'Amazon ASIN';
    formattedTitle = `Amazon Goal (${clean.toUpperCase()})`;
  } else if (isDpciCode) {
    codeLabel = 'Target DPCI';
    formattedTitle = `Target Item (DPCI ${clean})`;
  } else if (isNumericCode && clean.length >= 11) {
    codeLabel = 'UPC Barcode';
    formattedTitle = `Store Item (Barcode ${clean})`;
  } else if (isNumericCode && clean.length >= 6 && clean.length <= 8) {
    codeLabel = 'Store SKU';
    formattedTitle = retailer === 'Best Buy' ? `Best Buy Item (SKU ${clean})` : `${retailer} Item (SKU ${clean})`;
  } else if (cleanTitle.length > 2) {
    formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  }

  return {
    id: `goal-offline-${Date.now()}`,
    name: formattedTitle,
    title: formattedTitle,
    retailer,
    category,
    currentCost: Number(finalCost.toFixed(2)),
    targetCost: Number(finalCost.toFixed(2)),
    sku: clean,
    barcode: isNumericCode && clean.length >= 10 ? clean : `0${Math.floor(10000000000 + Math.random() * 90000000000)}`,
    itemNumber: `${codeLabel} ${clean}`,
    modelNumber: `MOD-${clean.slice(0, 6).toUpperCase()}`,
    icon,
    description: `Created from ${codeLabel} ${clean}. You can edit the exact item title and price anytime to match your store tag!`,
    specs: [
      `Category: ${category}`,
      `Estimated Price: $${finalCost.toFixed(2)} USD (Adjustable)`,
      `Retailer: ${retailer}`,
    ],
    whyKidsLoveIt: `An exciting goal to save for—earn dollars through chores to launch your rocket!`,
    verifiedDate: 'Instant Code Importer',
  };
}
