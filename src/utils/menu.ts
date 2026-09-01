import { DayOfWeekKey, DailyDinnerPlan, WeeklyDinnerMenu, MealVotingOption, MealSuggestion, FamilyDatabase, MealRecipe } from '../types';

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

export const RECIPE_PRESETS_DATABASE: Record<string, MealRecipe> = {
  'Creamy Garlic Chicken Alfredo Pasta': {
    prepTime: '15 mins',
    cookTime: '20 mins',
    servings: '4-6 servings',
    difficulty: 'Easy',
    ingredients: [
      '1 lb Fettuccine or Penne pasta',
      '2 large Chicken breasts, sliced into strips',
      '3 tbsp Salted butter',
      '4 cloves Garlic, minced',
      '1.5 cups Heavy whipping cream (or whole milk + cream cheese)',
      '1.5 cups Freshly grated Parmesan cheese',
      '1 tbsp Olive oil',
      '1/2 tsp Italian seasoning, salt and black pepper',
      '2 tbsp Fresh chopped parsley for garnish',
    ],
    instructions: [
      'Boil pasta in a large pot of salted water according to package instructions until al dente. Reserve 1/2 cup pasta water, then drain.',
      'In a large skillet over medium-high heat, warm olive oil. Season chicken with salt, pepper, and Italian herbs. Sear for 6-8 minutes until golden brown and cooked through (165°F). Transfer to a plate.',
      'In the same skillet, melt butter over medium heat. Add minced garlic and sauté for 1 minute until fragrant.',
      'Pour in heavy cream and bring to a gentle simmer for 3 minutes.',
      'Lower heat, slowly whisk in grated Parmesan until smooth and creamy. If sauce is too thick, splash in reserved pasta water.',
      'Toss in cooked pasta and seared chicken until evenly coated. Garnish with fresh parsley and serve hot with garlic bread!',
    ],
    substitutions: [
      'Gluten-Free: Swap with gluten-free penne or chickpea pasta.',
      'Dairy-Free: Use full-fat coconut cream and nutritional yeast or vegan parmesan.',
      'Vegetarian: Replace chicken with sautéed baby bella mushrooms and broccoli florets.',
    ],
    notes: 'Kids love sprinkling extra parmesan on top! Great with a crisp green salad.',
  },
  'Loaded Build-Your-Own Taco Bar': {
    prepTime: '15 mins',
    cookTime: '15 mins',
    servings: '4-6 servings',
    difficulty: 'Quick',
    ingredients: [
      '1.5 lbs Lean ground beef or shredded chicken breast',
      '1 packet (or 2 tbsp) Taco seasoning',
      '1/2 cup Water or chicken broth',
      '10-12 Crunchy taco shells and warm soft flour tortillas',
      '1.5 cups Shredded cheddar or Mexican blend cheese',
      '1 cup Shredded iceberg lettuce',
      '1 cup Diced ripe tomatoes',
      '1/2 cup Sour cream or Greek yogurt',
      '1 ripe Avocado (mashed with lime juice and salt) or guacamole',
      '1/2 cup Mild or medium salsa',
    ],
    instructions: [
      'In a large skillet, brown the ground beef over medium-high heat until no longer pink (6-8 minutes). Drain excess fat.',
      'Stir in taco seasoning and water. Simmer on low for 5 minutes until sauce thickens and meat is savory.',
      'Warm taco shells and tortillas in a 350°F oven for 3-5 minutes until warm and fragrant.',
      'Arrange all toppings (cheese, lettuce, tomatoes, sour cream, salsa, guacamole) in small colorful bowls around the table.',
      'Let kids and parents build their dream custom tacos with their favorite crunchy and soft combinations!',
    ],
    substitutions: [
      'Plant-Based: Swap ground meat for seasoned black beans, pinto beans, or walnut taco meat.',
      'Low Carb: Serve over crisp romaine lettuce for a taco salad bowl.',
      'Gluten-Free: Use 100% yellow corn tortillas and certified gluten-free seasoning.',
    ],
    notes: 'Assign kids to fill the cheese and lettuce bowls as a fun dinner helper chore!',
  },
  'Teriyaki Salmon & Crispy Tofu Bowls': {
    prepTime: '15 mins',
    cookTime: '15 mins',
    servings: '4 servings',
    difficulty: 'Easy',
    ingredients: [
      '4 Salmon fillets (or 1 block extra firm tofu, cubed and cornstarch-coated)',
      '1/3 cup Teriyaki sauce (low sodium)',
      '1 tbsp Honey or brown sugar',
      '1 tsp Sesame oil & 1 tsp grated fresh ginger',
      '3 cups Cooked jasmine or brown rice',
      '2 cups Steamed broccoli florets & shredded carrots',
      '1 cup Shelled edamame (steamed)',
      '1 tbsp Toasted sesame seeds & sliced green onions',
    ],
    instructions: [
      'Preheat oven or air fryer to 400°F (200°C). Line a baking sheet with parchment paper.',
      'Whisk together teriyaki sauce, honey, sesame oil, and ginger.',
      'Brush salmon fillets (or tofu cubes) generously with the glaze.',
      'Bake for 12-14 minutes until salmon flakes easily with a fork and edges are caramelized (or air-fry for 10 mins).',
      'Scoop warm jasmine rice into individual bowls. Top with glazed salmon/tofu, steamed broccoli, carrots, and edamame.',
      'Drizzle extra teriyaki glaze on top and sprinkle with sesame seeds and green onions.',
    ],
    substitutions: [
      'Protein Swaps: Works amazing with grilled chicken breast tenders or peeled shrimp.',
      'Grain Swaps: Swap rice for quinoa or cauliflower rice.',
    ],
    notes: 'Kids love the sweet teriyaki glaze and bright green edamame beans.',
  },
  'Gourmet Cheddar Smash Burgers': {
    prepTime: '10 mins',
    cookTime: '10 mins',
    servings: '4-6 servings',
    difficulty: 'Quick',
    ingredients: [
      '1.5 lbs 80/20 Ground beef, formed into loose 3-oz balls',
      '4-6 Soft brioche burger buns',
      '6 slices Sharp yellow cheddar or American cheese',
      '2 tbsp Butter for toasting buns',
      '1 tsp Garlic powder, sea salt, and black pepper',
      'Burger Sauce: 1/4 cup mayo, 2 tbsp ketchup, 1 tsp relish, 1/2 tsp mustard',
      'Toppings: Crisp lettuce, sliced dill pickles, ripe tomato slices',
    ],
    instructions: [
      'Heat a heavy cast-iron skillet or griddle on high until smoking hot.',
      'Butter the brioche buns and toast cut-side down for 1-2 minutes until golden brown; set aside.',
      'Place beef balls onto sizzling dry skillet. Using a heavy spatula, smash flat into thin patties with lacy crispy edges.',
      'Season generously with salt, pepper, and garlic powder. Sear without moving for 2.5 minutes until crust forms.',
      'Flip patties, immediately top with cheese slices, and cook for 1 more minute until cheese is completely melted.',
      'Spread burger sauce on toasted buns, stack single or double cheesy patties, top with pickles and lettuce, and enjoy!',
    ],
    substitutions: [
      'Poultry Option: Ground turkey patties seasoned with Worcestershire sauce.',
      'Veggie Option: Black bean burger patties or portobello mushroom caps.',
    ],
    notes: 'Serve with oven-baked sweet potato fries or crunchy potato chips.',
  },
  'Brick-Oven Style Pepperoni & Cheese Pizzas': {
    prepTime: '15 mins',
    cookTime: '12 mins',
    servings: '4-6 servings',
    difficulty: 'Easy',
    ingredients: [
      '1 lb Fresh pizza dough (store-bought or homemade) or 4 flatbreads',
      '1 cup Quality pizza sauce or marinara',
      '2.5 cups Shredded low-moisture whole milk mozzarella cheese',
      '1/2 cup Sliced pepperoni (or mini turkey pepperoni)',
      '1 tbsp Olive oil & 1/2 tsp dried oregano and garlic powder',
      'Optional Toppings: Bell peppers, sliced black olives, mushrooms, fresh basil',
    ],
    instructions: [
      'Preheat oven to 475°F (245°C) with a pizza stone or heavy baking sheet inside.',
      'Roll or stretch pizza dough on parchment paper into circles or sheet-pan rectangle.',
      'Brush edges lightly with olive oil and sprinkle with garlic powder.',
      'Spread pizza sauce evenly, leaving a 1/2-inch border for the crust.',
      'Cover with shredded mozzarella and arrange pepperoni and favorite toppings.',
      'Bake for 10-14 minutes until crust is golden brown and cheese is bubbling with golden spots.',
      'Let cool for 3 minutes, slice into triangles or squares, and top with fresh basil.',
    ],
    substitutions: [
      'Gluten-Free: Use cauliflower pizza crust or certified GF dough.',
      'Dairy-Free: Use vegan mozzarella shreds that melt well.',
    ],
    notes: 'Give each child their own mini personal dough ball to customize their toppings!',
  },
  'Tender Pulled Pork / BBQ Jackfruit Sandwiches': {
    prepTime: '10 mins',
    cookTime: '4-6 hrs (Slow Cooker) or 45 mins (Instant Pot)',
    servings: '6-8 servings',
    difficulty: 'Easy',
    ingredients: [
      '3 lbs Pork shoulder / pork butt (or 2 cans young green jackfruit for vegan)',
      '1 cup Sweet & smoky BBQ sauce (plus extra for serving)',
      '1/2 cup Apple cider vinegar or apple juice',
      '1 tbsp Brown sugar, 1 tsp smoked paprika, 1 tsp garlic powder, salt & pepper',
      '6-8 Soft potato or hamburger buns',
      '1 bag Crunchy coleslaw mix + 3 tbsp light slaw dressing',
    ],
    instructions: [
      'Rub pork shoulder with brown sugar, paprika, garlic powder, salt, and black pepper.',
      'Place in slow cooker with apple cider vinegar. Cover and cook on LOW for 7-8 hours or HIGH for 4-5 hours until fall-apart tender.',
      'Remove pork to a large bowl and shred with two forks, discarding any excess fat.',
      'Toss shredded meat with 1 cup of BBQ sauce and 2-3 spoonfuls of flavorful cooking juices.',
      'Toss coleslaw mix with dressing.',
      'Pile hot pulled pork high on toasted buns, top with a spoonful of cool crunchy slaw, and drizzle extra BBQ sauce.',
    ],
    substitutions: [
      'Chicken BBQ: Use 2.5 lbs boneless skinless chicken breasts or thighs (cook on LOW for 4 hours).',
    ],
    notes: 'Amazing next-day leftovers for BBQ quesadillas, loaded baked potatoes, or tacos!',
  },
  'Herb Roasted Chicken & Golden Crispy Potatoes': {
    prepTime: '15 mins',
    cookTime: '45 mins',
    servings: '4-6 servings',
    difficulty: 'Easy',
    ingredients: [
      '8 Bone-in chicken thighs or drumsticks (or 1 whole cut chicken)',
      '1.5 lbs Baby gold potatoes, halved',
      '1 lb Fresh green beans or baby carrots',
      '3 tbsp Olive oil',
      '3 cloves Garlic, minced',
      '1 tbsp Fresh rosemary and thyme, finely chopped (or 1 tsp dried)',
      '1 Lemon (juiced and zested)',
      '1 tsp Sea salt, black pepper, and paprika',
    ],
    instructions: [
      'Preheat oven to 400°F (200°C). Line a large rimmed baking sheet with foil or parchment.',
      'In a bowl, toss halved baby potatoes and carrots with 1.5 tbsp olive oil, half the garlic, salt, and pepper. Spread evenly on baking sheet.',
      'Pat chicken dry with paper towels. Rub with remaining olive oil, lemon juice, lemon zest, herbs, paprika, and salt.',
      'Nestle chicken pieces skin-side up between the potatoes on the baking sheet.',
      'Roast for 35-42 minutes until chicken skin is crispy golden and internal temp reaches 165°F, and potatoes are tender and crisp.',
      'Broil for 2 minutes for extra-crisp skin if desired. Rest for 5 minutes before serving with pan drippings!',
    ],
    substitutions: [
      'Boneless Chicken: Use boneless chicken thighs or breasts (roast for 25-30 mins).',
    ],
    notes: 'One pan makes cleanup effortless on Sunday evening!',
  },
  'Macaroni & Cheese with Crispy Panko': {
    prepTime: '10 mins',
    cookTime: '20 mins',
    servings: '4-6 servings',
    difficulty: 'Easy',
    ingredients: [
      '1 lb Elbow macaroni or cavatappi pasta',
      '4 tbsp Butter & 1/4 cup all-purpose flour',
      '3 cups Whole milk (warmed)',
      '3 cups Freshly shredded Sharp Cheddar & Monterey Jack cheese',
      '1/2 tsp Dijon mustard, 1/2 tsp garlic powder, salt & white pepper',
      'Topping: 1/2 cup Panko breadcrumbs + 1 tbsp melted butter + 1/4 cup parmesan',
    ],
    instructions: [
      'Cook pasta in salted water for 1 minute less than package directions; drain.',
      'In a large saucepan, melt 4 tbsp butter over medium heat. Whisk in flour and cook for 1 minute to make a roux.',
      'Slowly pour in warm milk while whisking constantly. Simmer for 3-4 minutes until thick and smooth.',
      'Remove from heat. Stir in mustard, garlic powder, and cheeses until velvety smooth.',
      'Fold in cooked macaroni. Transfer to a baking dish.',
      'Toss panko with melted butter and parmesan; sprinkle over macaroni.',
      'Bake at 375°F for 15 minutes or broil for 3 minutes until topping is crunchy golden brown!',
    ],
    substitutions: [
      'Protein Add-ins: Fold in diced ham, crispy bacon bits, or rotisserie chicken.',
      'Gluten-Free: Use GF pasta and 1-to-1 GF flour.',
    ],
    notes: 'The ultimate rainy-day family comfort dinner.',
  },
  'Sheet Pan Chicken & Bell Pepper Fajitas': {
    prepTime: '12 mins',
    cookTime: '18 mins',
    servings: '4-6 servings',
    difficulty: 'Quick',
    ingredients: [
      '1.5 lbs Boneless chicken breasts, sliced into thin strips',
      '3 Bell peppers (red, yellow, green), sliced',
      '1 Red onion, sliced',
      '2.5 tbsp Olive oil',
      'Fajita Seasoning: 1 tbsp chili powder, 1 tsp cumin, 1 tsp garlic powder, 1/2 tsp oregano, salt & pepper',
      '1 Lime, juiced',
      '8 Warm flour tortillas, salsa, sour cream, and fresh cilantro',
    ],
    instructions: [
      'Preheat oven to 425°F (220°C).',
      'Place sliced chicken, bell peppers, and red onions directly on a large baking sheet.',
      'Drizzle with olive oil and lime juice, then sprinkle fajita seasoning evenly over everything.',
      'Toss thoroughly with tongs and spread out into a single flat layer.',
      'Roast for 18-20 minutes until chicken is thoroughly cooked and peppers have caramelized charred edges.',
      'Serve sizzling directly with warm tortillas and favorite toppings!',
    ],
    substitutions: [
      'Steak Option: Use flank steak or sirloin sliced across the grain.',
      'Vegetarian: Replace chicken with sliced portobello mushrooms and black beans.',
    ],
    notes: 'Fast 30-minute weeknight dinner with almost zero dirty pots!',
  },
  'Lemon Herb Grilled Chicken Bowls': {
    prepTime: '15 mins',
    cookTime: '15 mins',
    servings: '4 servings',
    difficulty: 'Easy',
    ingredients: [
      '1.5 lbs Chicken breasts or cutlets',
      'Marinade: 3 tbsp Olive oil, juice of 1 lemon, 2 cloves minced garlic, 1 tsp oregano, salt & pepper',
      '3 cups Cooked brown rice or quinoa',
      '1 English cucumber, diced & 1 cup cherry tomatoes, halved',
      '1/2 cup Kalamata olives & 1/2 cup crumbled feta cheese',
      '1/2 cup Cool tzatziki sauce & warm pita bread triangles',
    ],
    instructions: [
      'Marinate chicken in olive oil, lemon juice, garlic, and oregano for 15-30 minutes.',
      'Grill or pan-sear chicken over medium-high heat for 5-6 minutes per side until golden and 165°F.',
      'Rest chicken for 5 minutes, then slice into bite-sized strips.',
      'Assemble bowls: Add base of warm rice/quinoa, top with sliced chicken, cucumber, tomatoes, olives, and feta.',
      'Drizzle with cool tzatziki and serve with warm pita triangles.',
    ],
    substitutions: [
      'Dairy-Free: Swap tzatziki with garlic hummus or tahini sauce.',
    ],
    notes: 'Healthy, fresh, and customizable for picky eaters who prefer ingredients separated.',
  },
  'Classic Shepherd\'s Pie with Creamy Potato Crust': {
    prepTime: '20 mins',
    cookTime: '30 mins',
    servings: '6 servings',
    difficulty: 'Medium',
    ingredients: [
      '1.5 lbs Ground beef or ground lamb',
      '1 Onion & 2 cloves garlic, finely chopped',
      '2 cups Frozen peas and carrots',
      '2 tbsp Tomato paste & 2 tbsp Worcestershire sauce',
      '2 tbsp All-purpose flour & 1.5 cups beef broth',
      '1 tsp Rosemary and thyme',
      'Potato Topping: 2 lbs Yukon gold potatoes (boiled & mashed with 4 tbsp butter, 1/3 cup milk, 1/2 cup cheddar)',
    ],
    instructions: [
      'Preheat oven to 400°F (200°C).',
      'In a large oven-safe skillet or Dutch oven, brown ground meat with onions and garlic. Drain excess fat.',
      'Stir in tomato paste, Worcestershire sauce, rosemary, thyme, and flour; cook for 1 minute.',
      'Pour in beef broth and simmer for 5 minutes until rich gravy forms. Stir in frozen peas and carrots.',
      'Spread warm buttery mashed potatoes evenly over the meat filling. Rake the top with a fork for crispy ridges.',
      'Bake for 25-30 minutes until potato peaks are golden and filling is bubbling at the edges.',
    ],
    substitutions: [
      'Turkey Swap: Use ground turkey with chicken broth for a lighter pie.',
    ],
    notes: 'Kids love the fluffy mashed potato crust with melted cheddar!',
  },
  'Quick Teriyaki Chicken & Broccoli Rice Bowls': {
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: '4 servings',
    difficulty: 'Quick',
    ingredients: [
      '1.5 lbs Boneless chicken thighs or breast, cut into 1-inch cubes',
      '3 cups Steamed white jasmine or brown rice',
      '3 cups Fresh broccoli florets',
      '1/2 cup Teriyaki sauce & 1 tbsp honey',
      '1 tbsp Cooking oil & 1 tsp sesame seeds',
      '2 Green onions, thinly sliced',
    ],
    instructions: [
      'Heat oil in a large skillet or wok over medium-high heat. Add chicken cubes and cook 6-8 minutes until golden.',
      'Add broccoli florets and 3 tablespoons of water. Cover skillet with lid for 3 minutes to steam broccoli tender-crisp.',
      'Remove lid, pour in teriyaki sauce and honey. Simmer for 2 minutes until glossy and chicken is coated.',
      'Scoop warm rice into bowls, top with teriyaki chicken and broccoli, and garnish with sesame seeds and green onions.',
    ],
    substitutions: [
      'Vegetarian: Use cubed tofu or edamame and cashews.',
    ],
    notes: 'Ready in under 20 minutes from start to finish!',
  },
};

/**
 * Intelligent helper to provide a step-by-step comprehensible recipe for any dish title.
 */
export const getRecipeForDish = (dishTitle: string, theme?: string): MealRecipe => {
  if (!dishTitle) {
    return {
      prepTime: '15 mins',
      cookTime: '20 mins',
      servings: '4-6 servings',
      difficulty: 'Easy',
      ingredients: ['1 lb Main protein or pasta', '2 cups Garden vegetables', '2 tbsp Olive oil or butter', 'Seasonings to taste'],
      instructions: ['Prep ingredients and preheat cooking surface.', 'Cook protein and veggies until tender.', 'Season and serve with favorite family sides!'],
    };
  }

  // Exact match
  if (RECIPE_PRESETS_DATABASE[dishTitle]) {
    return RECIPE_PRESETS_DATABASE[dishTitle];
  }

  // Fuzzy match
  const lower = dishTitle.toLowerCase();
  for (const [key, recipe] of Object.entries(RECIPE_PRESETS_DATABASE)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return recipe;
    }
  }

  if (lower.includes('taco') || lower.includes('fajita') || lower.includes('quesadilla') || lower.includes('mexican')) {
    return RECIPE_PRESETS_DATABASE['Loaded Build-Your-Own Taco Bar'];
  }
  if (lower.includes('pizza') || lower.includes('flatbread') || lower.includes('calzone')) {
    return RECIPE_PRESETS_DATABASE['Brick-Oven Style Pepperoni & Cheese Pizzas'];
  }
  if (lower.includes('burger') || lower.includes('slider') || lower.includes('patty')) {
    return RECIPE_PRESETS_DATABASE['Gourmet Cheddar Smash Burgers'];
  }
  if (lower.includes('pasta') || lower.includes('alfredo') || lower.includes('spaghetti') || lower.includes('lasagna')) {
    return RECIPE_PRESETS_DATABASE['Creamy Garlic Chicken Alfredo Pasta'];
  }
  if (lower.includes('mac') || lower.includes('cheese')) {
    return RECIPE_PRESETS_DATABASE['Macaroni & Cheese with Crispy Panko'];
  }
  if (lower.includes('bbq') || lower.includes('pork') || lower.includes('sandwich')) {
    return RECIPE_PRESETS_DATABASE['Tender Pulled Pork / BBQ Jackfruit Sandwiches'];
  }
  if (lower.includes('salmon') || lower.includes('teriyaki') || lower.includes('stir-fry') || lower.includes('rice bowl')) {
    return RECIPE_PRESETS_DATABASE['Teriyaki Salmon & Crispy Tofu Bowls'];
  }
  if (lower.includes('chicken') || lower.includes('roast') || lower.includes('poultry')) {
    return RECIPE_PRESETS_DATABASE['Herb Roasted Chicken & Golden Crispy Potatoes'];
  }
  if (lower.includes('stew') || lower.includes('pot roast') || lower.includes('pie') || lower.includes('soup')) {
    return RECIPE_PRESETS_DATABASE['Classic Shepherd\'s Pie with Creamy Potato Crust'];
  }

  // Default dynamic generated recipe
  return {
    prepTime: '15 mins',
    cookTime: '25 mins',
    servings: '4-6 servings',
    difficulty: 'Easy',
    ingredients: [
      `1.5 lbs Main protein or base for ${dishTitle}`,
      '2 cups Fresh vegetables (onions, bell peppers, broccoli, or carrots)',
      '2 tbsp Olive oil or butter',
      'Seasonings: 1 tsp garlic powder, sea salt, black pepper, and herbs to taste',
      'Fresh garnishes (parsley, cheese, or lemon wedges)',
    ],
    instructions: [
      `Preheat stove, oven, or grill to appropriate cooking temperature.`,
      `Wash and slice vegetables; season protein with salt, pepper, and herbs.`,
      `Cook protein and aromatics in a skillet or baking sheet until golden and thoroughly cooked.`,
      `Incorporate sauces and sides, stirring well to combine flavors.`,
      `Garnish with fresh herbs or cheese and serve warm at the family dinner table!`,
    ],
    substitutions: [
      'Gluten-Free: Ensure all seasonings and grain sides are certified GF.',
      'Vegetarian: Substitute protein with tofu, beans, or hearty mushrooms.',
    ],
    notes: `Custom recipe created for ${dishTitle}. Edit any ingredients or steps to match your family pantry!`,
  };
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
      recipe: RECIPE_PRESETS_DATABASE['Creamy Garlic Chicken Alfredo Pasta'],
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
      recipe: RECIPE_PRESETS_DATABASE['Loaded Build-Your-Own Taco Bar'],
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
      recipe: RECIPE_PRESETS_DATABASE['Teriyaki Salmon & Crispy Tofu Bowls'],
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
      recipe: RECIPE_PRESETS_DATABASE['Gourmet Cheddar Smash Burgers'],
    },
    friday: {
      dayOfWeek: 'friday',
      theme: 'Kids\' Choice: Friday Pizza & Movie Night! 🍕🎬',
      mainDish: 'Brick-Oven Style Pepperoni & Cheese Pizzas',
      sideDishes: 'Crispy Veggie Sticks with Ranch & Mozzarella Bites',
      dessert: 'Ice Cream Sundae Bar with Sprinkles',
      preparedBy: 'Family Cook-Off Squad 🧑‍🍳',
      icon: '🍕',
      notes: 'Movie starts right after dinner at 6:30 PM!',
      votingEnabled: true,
      votingQuestion: "Kids Vote: What feast should we make for Friday Movie Night?",
      recipe: RECIPE_PRESETS_DATABASE['Brick-Oven Style Pepperoni & Cheese Pizzas'],
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
      recipe: RECIPE_PRESETS_DATABASE['Tender Pulled Pork / BBQ Jackfruit Sandwiches'],
    },
    sunday: {
      dayOfWeek: 'sunday',
      theme: 'Sunday Comfort Food Feast 🍲',
      mainDish: 'Herb Roasted Chicken & Golden Crispy Potatoes',
      sideDishes: 'Buttery Golden Mashed Potatoes & Honey Glazed Carrots',
      dessert: 'Warm Chocolate Chip Cookies straight from the oven',
      preparedBy: 'Mom & Dad',
      icon: '🍲',
      notes: 'Family dinner table conversation game tonight!',
      votingEnabled: true,
      votingQuestion: "Vote on Sunday's Homestyle Comfort Dish:",
      recipe: RECIPE_PRESETS_DATABASE['Herb Roasted Chicken & Golden Crispy Potatoes'],
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
  const dayIndex = d.getDay();
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
    name: '🌟 Kid Favorites Feast Week',
    description: 'Crowd-pleasing family hits that kids cheer for every night',
    menu: {
      monday: {
        main: 'Macaroni & Cheese with Crispy Panko',
        side: 'Steamed broccoli florets & cinnamon applesauce',
        icon: '🧀',
        recipe: RECIPE_PRESETS_DATABASE['Macaroni & Cheese with Crispy Panko'],
      },
      tuesday: {
        main: 'Loaded Build-Your-Own Taco Bar',
        side: 'Mexican rice, black beans & tortilla chips',
        icon: '🌮',
        recipe: RECIPE_PRESETS_DATABASE['Loaded Build-Your-Own Taco Bar'],
      },
      wednesday: {
        main: 'Crispy Baked Chicken Tenders & Sweet Potato Fries',
        side: 'Honey mustard dipping sauce & cucumber slices',
        icon: '🍗',
        recipe: getRecipeForDish('Crispy Baked Chicken Tenders'),
      },
      thursday: {
        main: 'Gourmet Cheddar Smash Burgers',
        side: 'Crispy waffle fries & sweet corn on the cob',
        icon: '🍔',
        recipe: RECIPE_PRESETS_DATABASE['Gourmet Cheddar Smash Burgers'],
      },
      friday: {
        main: 'Brick-Oven Style Pepperoni & Cheese Pizzas',
        side: 'Crispy veggie sticks with ranch & garlic knots',
        icon: '🍕',
        recipe: RECIPE_PRESETS_DATABASE['Brick-Oven Style Pepperoni & Cheese Pizzas'],
      },
      saturday: {
        main: 'Hot Dog & Pulled Pork Slider BBQ Bar',
        side: 'Watermelon slices & potato salad',
        icon: '🌭',
        recipe: RECIPE_PRESETS_DATABASE['Tender Pulled Pork / BBQ Jackfruit Sandwiches'],
      },
      sunday: {
        main: 'Creamy Garlic Chicken Alfredo Pasta',
        side: 'Cheesy garlic bread & garden Caesar salad',
        icon: '🍝',
        recipe: RECIPE_PRESETS_DATABASE['Creamy Garlic Chicken Alfredo Pasta'],
      },
    },
  },
  {
    name: '🥗 Fresh & Vibrant Mediterranean',
    description: 'Colorful, wholesome, nutrient-packed dinners with crisp veggies & fresh herbs',
    menu: {
      monday: {
        main: 'Lemon Herb Grilled Chicken Bowls',
        side: 'Tzatziki sauce, cucumber tomato salad & warm pita',
        icon: '🥗',
        recipe: RECIPE_PRESETS_DATABASE['Lemon Herb Grilled Chicken Bowls'],
      },
      tuesday: {
        main: 'Baja Fish or Black Bean Tacos',
        side: 'Avocado crema, crunchy lime slaw & cilantro rice',
        icon: '🌮',
        recipe: getRecipeForDish('Baja Fish Tacos'),
      },
      wednesday: {
        main: 'Teriyaki Salmon & Crispy Tofu Bowls',
        side: 'Steamed jasmine rice & garlic butter edamame',
        icon: '🍣',
        recipe: RECIPE_PRESETS_DATABASE['Teriyaki Salmon & Crispy Tofu Bowls'],
      },
      thursday: {
        main: 'Greek Turkey Meatball Skewers',
        side: 'Lemon herb orzo salad, feta cheese & garlic hummus',
        icon: '🍢',
        recipe: getRecipeForDish('Greek Turkey Meatball Skewers'),
      },
      friday: {
        main: 'Mediterranean Flatbread Pizzas',
        side: 'Chopped Italian garden salad with balsamic vinaigrette',
        icon: '🍕',
        recipe: getRecipeForDish('Mediterranean Flatbread Pizzas'),
      },
      saturday: {
        main: 'Crispy Falafel & Hummus Wraps',
        side: 'Roasted sweet potato wedges & creamy tahini dip',
        icon: '🌯',
        recipe: getRecipeForDish('Crispy Falafel & Hummus Wraps'),
      },
      sunday: {
        main: 'Hearty Tuscan Minestrone Soup with White Beans',
        side: 'Crusty sourdough bread & grated parmesan',
        icon: '🍲',
        recipe: getRecipeForDish('Hearty Tuscan Minestrone Soup'),
      },
    },
  },
  {
    name: '⚡ 20-Minute Weeknight Rush',
    description: 'Ultra-fast, delicious meals designed for busy school, sports & activity nights',
    menu: {
      monday: {
        main: 'One-Pot Creamy Pesto Tortellini',
        side: 'Warm garlic bread & blistered cherry tomatoes',
        icon: '🥟',
        recipe: getRecipeForDish('One-Pot Creamy Pesto Tortellini'),
      },
      tuesday: {
        main: 'Sheet Pan Chicken & Bell Pepper Fajitas',
        side: 'Warm flour tortillas, salsa verde & sour cream',
        icon: '🌮',
        recipe: RECIPE_PRESETS_DATABASE['Sheet Pan Chicken & Bell Pepper Fajitas'],
      },
      wednesday: {
        main: 'Quick Teriyaki Chicken & Broccoli Rice Bowls',
        side: 'Steamed edamame pods & vegetable potstickers',
        icon: '🍚',
        recipe: RECIPE_PRESETS_DATABASE['Quick Teriyaki Chicken & Broccoli Rice Bowls'],
      },
      thursday: {
        main: 'Gourmet 3-Cheese Grilled Cheese & Tomato Basil Soup',
        side: 'Crispy kettle chips & dill pickle spears',
        icon: '🥪',
        recipe: getRecipeForDish('Gourmet Grilled Cheese & Tomato Soup'),
      },
      friday: {
        main: 'Cast Iron French Bread Pizza Boats',
        side: 'Green salad & fresh fruit bowl',
        icon: '🍕',
        recipe: getRecipeForDish('French Bread Pizza Boats'),
      },
      saturday: {
        main: 'Cheesy Quesadillas & Loaded Black Bean Nachos',
        side: 'Fresh guacamole & mild salsa',
        icon: '🧀',
        recipe: getRecipeForDish('Cheesy Quesadillas & Loaded Nachos'),
      },
      sunday: {
        main: 'Tender Pulled Pork / BBQ Jackfruit Sandwiches',
        side: 'Sweet brown sugar baked beans & crunchy coleslaw',
        icon: '🥪',
        recipe: RECIPE_PRESETS_DATABASE['Tender Pulled Pork / BBQ Jackfruit Sandwiches'],
      },
    },
  },
  {
    name: '🍲 Cozy Homestyle Comforts',
    description: 'Hearty, warm, and deeply satisfying family comfort classics',
    menu: {
      monday: {
        main: 'Creamy Garlic Chicken Alfredo Pasta',
        side: 'Buttery garlic bread & Caesar salad',
        icon: '🍝',
        recipe: RECIPE_PRESETS_DATABASE['Creamy Garlic Chicken Alfredo Pasta'],
      },
      tuesday: {
        main: 'Loaded Cheesy Beef Enchilada Bake',
        side: 'Spanish rice & refried pinto beans',
        icon: '🥘',
        recipe: getRecipeForDish('Cheesy Beef Enchiladas'),
      },
      wednesday: {
        main: 'Classic Shepherd\'s Pie with Creamy Potato Crust',
        side: 'Honey glazed carrots & buttered sweet peas',
        icon: '🥧',
        recipe: RECIPE_PRESETS_DATABASE['Classic Shepherd\'s Pie with Creamy Potato Crust'],
      },
      thursday: {
        main: 'Crispy Baked Chicken Parmesan with Marinara',
        side: 'Spaghetti with garlic oil & steamed green beans',
        icon: '🍗',
        recipe: getRecipeForDish('Crispy Baked Chicken Parmesan'),
      },
      friday: {
        main: 'Brick-Oven Style Pepperoni & Cheese Pizzas',
        side: 'Antipasto salad & mozzarella sticks',
        icon: '🍕',
        recipe: RECIPE_PRESETS_DATABASE['Brick-Oven Style Pepperoni & Cheese Pizzas'],
      },
      saturday: {
        main: 'Slow-Cooker Sunday Pot Roast with Gravy',
        side: 'Tender potatoes, baby carrots & dinner rolls',
        icon: '🥩',
        recipe: getRecipeForDish('Slow-Cooker Pot Roast with Gravy'),
      },
      sunday: {
        main: 'Herb Roasted Chicken & Golden Crispy Potatoes',
        side: 'Buttery mashed potatoes & roasted asparagus',
        icon: '🍗',
        recipe: RECIPE_PRESETS_DATABASE['Herb Roasted Chicken & Golden Crispy Potatoes'],
      },
    },
  },
  {
    name: '🥢 Asian Street & Noodle Favorites',
    description: 'Crispy stir-fries, savory noodles, and vibrant Asian-inspired family bowls',
    menu: {
      monday: {
        main: 'Savory Beef & Broccoli Lo Mein Noodles',
        side: 'Crispy vegetable spring rolls & sweet chili dip',
        icon: '🥢',
        recipe: getRecipeForDish('Beef & Broccoli Lo Mein Noodles'),
      },
      tuesday: {
        main: 'Crispy Sweet & Sour Chicken with Pineapple',
        side: 'Steamed jasmine rice & sesame snap peas',
        icon: '🍍',
        recipe: getRecipeForDish('Sweet & Sour Chicken with Pineapple'),
      },
      wednesday: {
        main: 'Teriyaki Salmon & Crispy Tofu Bowls',
        side: 'Steamed jasmine rice & garlic edamame',
        icon: '🍣',
        recipe: RECIPE_PRESETS_DATABASE['Teriyaki Salmon & Crispy Tofu Bowls'],
      },
      thursday: {
        main: 'Japanese Crispy Chicken Katsu with Tonkatsu Sauce',
        side: 'Shredded cabbage salad & warm miso soup',
        icon: '🍱',
        recipe: getRecipeForDish('Chicken Katsu with Tonkatsu Sauce'),
      },
      friday: {
        main: 'Vietnamese Lemongrass Chicken Noodle Bowls',
        side: 'Fresh cucumber slices, pickled carrots & mint',
        icon: '🍜',
        recipe: getRecipeForDish('Lemongrass Chicken Noodle Bowls'),
      },
      saturday: {
        main: 'Quick Chicken Fried Rice & Steamed Pork Dumplings',
        side: 'Egg drop soup & crispy wontons',
        icon: '🥟',
        recipe: getRecipeForDish('Chicken Fried Rice & Dumplings'),
      },
      sunday: {
        main: 'Slow-Simmered Coconut Curry with Chicken & Sweet Potatoes',
        side: 'Fluffy jasmine rice & warm naan bread',
        icon: '🍛',
        recipe: getRecipeForDish('Coconut Chicken Curry with Sweet Potatoes'),
      },
    },
  },
];
