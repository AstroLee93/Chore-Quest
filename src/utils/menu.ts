import { DayOfWeekKey, DailyDinnerPlan, WeeklyDinnerMenu, MealVotingOption, MealSuggestion, FamilyDatabase } from '../types';

const getInitialDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DAYS_OF_WEEK_ORDER: DayOfWeekKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_METADATA: Record<
  DayOfWeekKey,
  { label: string; shortLabel: string; emoji: string; defaultTheme: string }
> = {
  monday: {
    label: 'Monday',
    shortLabel: 'Mon',
    emoji: '🍝',
    defaultTheme: 'Italian Comfort Night',
  },
  tuesday: {
    label: 'Tuesday',
    shortLabel: 'Tue',
    emoji: '🌮',
    defaultTheme: 'Taco Tuesday!',
  },
  wednesday: {
    label: 'Wednesday',
    shortLabel: 'Wed',
    emoji: '🍣',
    defaultTheme: 'Stir-Fry & Noodle Bowls',
  },
  thursday: {
    label: 'Thursday',
    shortLabel: 'Thu',
    emoji: '🍔',
    defaultTheme: 'Grill & Chill Night',
  },
  friday: {
    label: 'Friday',
    shortLabel: 'Fri',
    emoji: '🍕',
    defaultTheme: 'Friday Family Pizza & Movie',
  },
  saturday: {
    label: 'Saturday',
    shortLabel: 'Sat',
    emoji: '🥪',
    defaultTheme: 'Weekend BBQ & Sandwiches',
  },
  sunday: {
    label: 'Sunday',
    shortLabel: 'Sun',
    emoji: '🍲',
    defaultTheme: 'Slow-Cooked Sunday Feast',
  },
};

export const DEFAULT_WEEKLY_MENU: WeeklyDinnerMenu = {
  title: "Family Weekly Dinner Menu",
  weekStartDate: getInitialDateString(),
  lastUpdated: new Date().toISOString(),
  days: {
    monday: {
      dayOfWeek: 'monday',
      theme: 'Italian Comfort Night',
      mainDish: 'Creamy Garlic Chicken Alfredo Pasta',
      sideDishes: 'Toasted Garlic Bread & Garden Caesar Salad',
      dessert: 'Fresh Strawberry Bowl',
      preparedBy: 'Mom & Leo 👨‍🍳',
      icon: '🍝',
      notes: 'Ready at 6:00 PM after homework!',
      votingEnabled: false,
    },
    tuesday: {
      dayOfWeek: 'tuesday',
      theme: 'Taco Tuesday Fiesta! 🌮',
      mainDish: 'Loaded Build-Your-Own Taco Bar',
      sideDishes: 'Cilantro Lime Rice, Black Beans & Fresh Guacamole',
      dessert: 'Warm Cinnamon Sugar Churro Bites',
      preparedBy: 'Dad & Maya 🦄',
      icon: '🌮',
      notes: 'Early dinner at 5:30 PM before evening soccer practice ⚽',
      votingEnabled: false,
    },
    wednesday: {
      dayOfWeek: 'wednesday',
      theme: 'Stir-Fry & Noodle Bowls 🥢',
      mainDish: 'Teriyaki Salmon & Crispy Tofu Bowls',
      sideDishes: 'Steamed Jasmine Rice & Garlic Butter Edamame',
      dessert: 'Mini Mochi Ice Cream Treats',
      preparedBy: 'Mom & Sam 🚀',
      icon: '🍣',
      notes: 'Make sure your bedroom is tidy before dinner!',
      votingEnabled: false,
    },
    thursday: {
      dayOfWeek: 'thursday',
      theme: 'Grill & Chill Smashburgers 🍔',
      mainDish: 'Gourmet Cheddar Smash Burgers',
      sideDishes: 'Crispy Sweet Potato Fries & Sweet Corn on the Cob',
      dessert: 'All-Natural Fruit Ice Pops',
      preparedBy: 'Dad & Leo 🦁',
      icon: '🍔',
      notes: 'Outdoor patio dinner if sunny weather! ☀️',
      votingEnabled: false,
    },
    friday: {
      dayOfWeek: 'friday',
      theme: 'Kids\' Choice: Friday Pizza & Movie Night! 🍕🎬',
      mainDish: 'Winner of the Friday Kids\' Meal Vote! 🏆',
      sideDishes: 'Crispy Veggie Sticks with Ranch & Mozzarella Bites',
      dessert: 'Ice Cream Sundae Bar with Sprinkles',
      preparedBy: 'Family Cook-Off Squad 🧑‍🍳',
      icon: '🍕',
      notes: 'Movie starts right after dinner at 6:30 PM!',
      votingEnabled: true,
      votingQuestion: "Kids Vote: What feast should we make for Friday Movie Night?",
      votingOptions: [
        {
          id: 'opt-pizza-fest',
          title: 'Brick-Oven Style Pepperoni & Cheese Pizzas 🍕',
          icon: '🍕',
          description: 'Custom personal pizzas with stretchy cheese and choice of toppings',
          voterKidIds: ['kid-1', 'kid-2'],
        },
        {
          id: 'opt-taco-stand',
          title: 'Crispy Carnitas & Quesadilla Fiesta 🌮',
          icon: '🌮',
          description: 'Melty cheesy quesadillas, salsa verde and crunchy nachos',
          voterKidIds: [],
        },
        {
          id: 'opt-slider-bar',
          title: 'Mini Sliders & Loaded Waffle Fry Mountain 🍔',
          icon: '🍔',
          description: 'Cheesy mini burgers with crispy criss-cut seasoned waffle fries',
          voterKidIds: ['kid-3'],
        },
      ],
      suggestions: [
        {
          id: 'sug-1',
          dish: 'Homemade Macaroni & Cheese with Crispy Bacon Crumbs 🥓',
          icon: '🧀',
          kidId: 'kid-1',
          voterKidIds: ['kid-1', 'kid-2'],
          createdAt: new Date().toISOString(),
        }
      ],
      lockedByParent: false,
    },
    saturday: {
      dayOfWeek: 'saturday',
      theme: 'Weekend Slow-Cooker BBQ 🥪',
      mainDish: 'Tender Pulled Pork / BBQ Jackfruit Sandwiches',
      sideDishes: 'Creamy Homestyle Coleslaw & Baked Brown Sugar Beans',
      dessert: 'Warm Dutch Apple Pie Slice',
      preparedBy: 'Dad',
      icon: '🥪',
      notes: 'Slow cooked all afternoon for maximum flavor!',
      votingEnabled: false,
    },
    sunday: {
      dayOfWeek: 'sunday',
      theme: 'Sunday Comfort Food Feast 🍲',
      mainDish: 'Vote between cozy homestyle comfort recipes!',
      sideDishes: 'Buttery Golden Mashed Potatoes & Honey Glazed Carrots',
      dessert: 'Warm Chocolate Chip Cookies straight from the oven',
      preparedBy: 'Mom & Dad',
      icon: '🍲',
      notes: 'Family dinner table conversation game tonight!',
      votingEnabled: true,
      votingQuestion: "Vote on Sunday's Homestyle Comfort Dish:",
      votingOptions: [
        {
          id: 'opt-sunday-roast',
          title: 'Herb Roasted Chicken & Golden Crispy Potatoes 🍗',
          icon: '🍗',
          description: 'Slow roasted chicken with rosemary gravy and stuffing',
          voterKidIds: ['kid-1'],
        },
        {
          id: 'opt-cheesy-lasagna',
          title: '3-Cheese Baked Lasagna with Garlic Focaccia 🧀',
          icon: '🧀',
          description: 'Bubbling mozzarella, savory marinara, and fresh basil',
          voterKidIds: ['kid-2', 'kid-3'],
        },
        {
          id: 'opt-pot-pie',
          title: 'Flaky Puff Pastry Chicken & Vegetable Pot Pie 🥧',
          icon: '🥧',
          description: 'Golden buttery crust filled with savory chicken and garden veggies',
          voterKidIds: [],
        },
      ],
      lockedByParent: false,
    },
  },
};

export const getCurrentDayOfWeekKey = (dateStr?: string): DayOfWeekKey => {
  const d = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
  const dayIndex = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const map: Record<number, DayOfWeekKey> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  return map[dayIndex] || 'monday';
};

export const getMealPresets = () => [
  {
    name: '🌟 Kid Favorites Week',
    description: 'Crowd-pleasing family hits that everyone cheers for',
    menu: {
      monday: { main: 'Macaroni & Cheese with Crispy Panko', side: 'Broccoli florets & applesauce', icon: '🧀' },
      tuesday: { main: 'Crispy Beef & Chicken Tacos', side: 'Mexican rice & tortilla chips', icon: '🌮' },
      wednesday: { main: 'Homemade Chicken Tenders & Fries', side: 'Honey mustard & veggie sticks', icon: '🍗' },
      thursday: { main: 'Mini Smash Burgers with Cheddar', side: 'Tater tots & sweet corn', icon: '🍔' },
      friday: { main: 'Friday Night Pizza & Calzones', side: 'Caesar salad & garlic knots', icon: '🍕' },
      saturday: { main: 'Hot Dog & Slider BBQ Bar', side: 'Watermelon slices & potato salad', icon: '🌭' },
      sunday: { main: 'Spaghetti & Giant Meatballs', side: 'Cheesy garlic bread & green beans', icon: '🍝' },
    },
  },
  {
    name: '🥗 Fresh & Vibrant Mediterranean',
    description: 'Colorful, wholesome, and nutrient-packed dinners',
    menu: {
      monday: { main: 'Lemon Herb Grilled Chicken Bowls', side: 'Tzatziki, cucumber salad & warm pita', icon: '🥗' },
      tuesday: { main: 'Fish or Black Bean Tacos', side: 'Avocado crema, slaw & lime rice', icon: '🌮' },
      wednesday: { main: 'Mediterranean Baked Salmon & Couscous', side: 'Roasted asparagus & cherry tomatoes', icon: '🍣' },
      thursday: { main: 'Greek Turkey Meatball Skewers', side: 'Orzo salad, feta & hummus', icon: '🍢' },
      friday: { main: 'Flatbread Pizzas with Arugula & Mozzarella', side: 'Chopped Italian salad', icon: '🍕' },
      saturday: { main: 'Falafel & Grilled Veggie Wraps', side: 'Sweet potato wedges & tahini', icon: '🌯' },
      sunday: { main: 'Hearty Tuscan Minestrone Stew', side: 'Crusty sourdough bread & parmesan', icon: '🍲' },
    },
  },
  {
    name: '⚡ Quick 20-Minute Weeknights',
    description: 'Fast, delicious meals for busy activity and sports days',
    menu: {
      monday: { main: 'One-Pot Pesto Tortellini', side: 'Garlic bread & cherry tomatoes', icon: '🥟' },
      tuesday: { main: 'Sheet Pan Chicken Fajitas', side: 'Warm flour tortillas & salsa', icon: '🌮' },
      wednesday: { main: 'Quick Teriyaki Rice Stir-Fry', side: 'Steamed edamame & dumplings', icon: '🍚' },
      thursday: { main: 'Gourmet Grilled Cheese & Tomato Soup', side: 'Crispy kettle chips & pickles', icon: '🥪' },
      friday: { main: 'Cast Iron French Bread Pizzas', side: 'Green salad & fruit cup', icon: '🍕' },
      saturday: { main: 'Quesadillas & Loaded Nachos', side: 'Guacamole & black bean dip', icon: '🧀' },
      sunday: { main: 'Dump & Go Slow Cooker Beef Stew', side: 'Fluffy dinner rolls', icon: '🍲' },
    },
  },
];
