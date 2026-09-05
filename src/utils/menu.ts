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
  'Peanut Butter and Jelly Sandwich (PB&J)': {
    prepTime: '3 mins',
    cookTime: '0 mins',
    servings: '2-4 sandwiches',
    difficulty: 'Quick',
    ingredients: [
      '4-8 slices Soft sandwich bread (white, whole wheat, or sourdough)',
      '4-6 tbsp Creamy or crunchy peanut butter (or sunflower seed / almond butter)',
      '4-6 tbsp Strawberry, grape, or raspberry fruit jelly or jam',
      'Optional: 1 sliced fresh banana, drizzle of honey, or pinch of cinnamon',
      'Sides: Cold milk, crisp baby carrots, or fresh apple slices',
    ],
    instructions: [
      'Lay bread slices out in pairs on a clean cutting board or plate.',
      'Spread peanut butter evenly from edge to edge on one slice of each pair (spreading to the edges prevents the jelly from making the bread soggy!).',
      'Spread fruit jelly or jam generously across the opposing bread slice.',
      'Optional: Layer sliced bananas or a light drizzle of honey over the peanut butter.',
      'Gently press the two bread slices together.',
      'Cut diagonally into triangles or fun sandwich shapes, and serve with cold milk and crisp fruit!',
    ],
    substitutions: [
      'Nut-Free / School Safe: Use sunflower seed butter (SunButter), soy nut butter, or cookie butter.',
      'Gluten-Free: Use your favorite certified gluten-free sandwich bread.',
      'Triple Decker: Add a third toasted bread slice in the center!',
    ],
    notes: 'A timeless family classic! Spreading peanut butter on both bread slices before adding jelly prevents sogginess if packing for later.',
  },
  'Deli Turkey, Ham & Cheddar Club Sandwiches': {
    prepTime: '5 mins',
    cookTime: '0 mins',
    servings: '4 sandwiches',
    difficulty: 'Quick',
    ingredients: [
      '8 slices Fresh bakery sandwich bread or hoagie rolls',
      '1/2 lb Sliced deli roasted turkey breast or honey ham',
      '8 slices Mild or sharp Cheddar cheese',
      '4 crisp Romaine lettuce leaves & 1 large ripe tomato, sliced',
      '3 tbsp Mayonnaise & 1 tbsp yellow or Dijon mustard',
      'Dill pickle spears & crunchy kettle potato chips for serving',
    ],
    instructions: [
      'Lay bread slices out on a clean board and spread mayonnaise and mustard across each slice.',
      'Layer sliced turkey or ham, cheddar cheese, crisp lettuce, and seasoned tomato slices.',
      'Top with matching bread slice, press gently, and slice diagonally into triangles.',
      'Serve fresh with crunchy potato chips and crisp dill pickle spears!',
    ],
    substitutions: [
      'Tortilla Wrap: Roll ingredients tightly inside a large flour or spinach tortilla and slice into pinwheels.',
      'Vegetarian: Swap deli meat with sliced avocado, cucumber ribbons, and hummus.',
    ],
    notes: 'Easy 5-minute lunch or quick dinner with zero cooking required.',
  },
  'Homestyle Sloppy Joes on Toasted Buns': {
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: '4-6 servings',
    difficulty: 'Easy',
    ingredients: [
      '1.5 lbs Lean ground beef or ground turkey',
      '1 small Yellow onion & 1/2 green bell pepper, finely minced',
      '2 cloves Garlic, minced',
      '1 cup Tomato sauce or ketchup',
      '2 tbsp Brown sugar, 1 tbsp Worcestershire sauce, 1 tbsp yellow mustard',
      '1 tsp Chili powder, sea salt, and cracked black pepper',
      '6 Soft brioche hamburger buns, lightly toasted',
    ],
    instructions: [
      'In a large skillet over medium-high heat, brown ground beef with minced onion and bell pepper for 6-8 minutes; drain excess fat.',
      'Stir in garlic, tomato sauce/ketchup, brown sugar, Worcestershire sauce, mustard, and chili powder.',
      'Simmer on medium-low heat for 8-10 minutes, stirring occasionally, until sauce is thick, rich, and glossy.',
      'Spoon hearty scoops of warm Sloppy Joe mixture onto toasted buns and serve immediately with fries or coleslaw!',
    ],
    substitutions: [
      'Plant-Based: Use canned brown lentils or plant-based ground meat.',
      'Gluten-Free: Serve over baked potatoes or with gluten-free burger buns.',
    ],
    notes: 'Sweet, tangy, and beloved by kids of all ages!',
  },
  'Fluffy Buttermilk Pancakes (Breakfast-for-Dinner)': {
    prepTime: '10 mins',
    cookTime: '10 mins',
    servings: '4 servings (8-12 pancakes)',
    difficulty: 'Easy',
    ingredients: [
      '2 cups All-purpose flour',
      '2 tbsp Sugar, 2 tsp baking powder, 1/2 tsp baking soda, 1/2 tsp salt',
      '2 cups Buttermilk (or whole milk + 2 tbsp lemon juice)',
      '2 large Eggs, beaten',
      '4 tbsp Melted unsalted butter & 1 tsp pure vanilla extract',
      'Toppings: Warm pure maple syrup, butter, fresh strawberries or blueberries, whipped cream',
    ],
    instructions: [
      'In a large bowl, whisk flour, sugar, baking powder, baking soda, and salt.',
      'In a separate bowl, whisk buttermilk, eggs, melted butter, and vanilla extract.',
      'Pour wet ingredients into dry ingredients and gently fold together until just combined (small lumps are fine; do not overmix!).',
      'Heat a lightly buttered nonstick skillet or griddle over medium heat (350°F).',
      'Pour 1/4 cup batter per pancake. Cook for 2-3 minutes until bubbles pop on top and edges look set. Flip and cook 1-2 minutes until golden.',
      'Stack high and serve hot with butter, warm maple syrup, and fresh berries!',
    ],
    substitutions: [
      'Fun Mix-ins: Fold in 1/2 cup chocolate chips or fresh blueberries into the batter.',
      'Gluten-Free: Use 1-to-1 gluten-free baking flour.',
    ],
    notes: 'Breakfast-for-dinner is always a top-voted family favorite on Friday or weekend nights!',
  },
  'Classic Hot Dogs & Crispy French Fries': {
    prepTime: '5 mins',
    cookTime: '10 mins',
    servings: '4 servings',
    difficulty: 'Quick',
    ingredients: [
      '8 Quality all-beef hot dogs or veggie dogs',
      '8 Soft hot dog buns',
      '1 bag Frozen french fries or tater tots',
      'Toppings: Ketchup, yellow mustard, sweet pickle relish, diced onions, shredded cheddar cheese',
    ],
    instructions: [
      'Bake or air-fry french fries at 425°F for 15-18 minutes until golden and crispy.',
      'Grill, pan-sear in a skillet, or boil hot dogs for 5-7 minutes until plump and lightly charred.',
      'Lightly warm or toast hot dog buns in a dry skillet or toaster.',
      'Nest hot dogs into buns, load with your favorite condiments, and serve alongside hot crispy fries!',
    ],
    substitutions: [
      'Veggie Dogs: Swap with plant-based jumbo veggie franks.',
      'Chili Dogs: Top with a scoop of warm bean chili and melted cheddar cheese.',
    ],
    notes: 'Quick 15-minute dinner perfect for busy sports nights!',
  },
  'Cheesy Crispy Quesadillas with Salsa & Guac': {
    prepTime: '5 mins',
    cookTime: '10 mins',
    servings: '4 servings',
    difficulty: 'Quick',
    ingredients: [
      '8 Large flour tortillas',
      '3 cups Shredded Monterey Jack and Cheddar cheese blend',
      '1.5 cups Cooked shredded chicken, seasoned black beans, or carnitas (optional)',
      '2 tbsp Butter for crisping',
      'For dipping: Fresh salsa, cool sour cream, and guacamole',
    ],
    instructions: [
      'Heat a large skillet or griddle over medium heat and melt 1/2 tsp butter.',
      'Place a tortilla flat in the skillet, sprinkle cheese and optional chicken/black beans over one half.',
      'Fold tortilla over into a half-moon shape.',
      'Cook for 3-4 minutes per side, pressing gently with a spatula, until golden brown, crispy, and cheese is completely melted.',
      'Slice into wedges with a pizza cutter and serve with salsa, sour cream, and guacamole!',
    ],
    substitutions: [
      'Corn Tortillas: Use small corn tortillas for gluten-free mini quesadillas.',
      'Extra Veggies: Add sautéed bell peppers and sweet corn inside.',
    ],
    notes: 'Super speedy dinner using leftover rotisserie chicken or pantry black beans.',
  },
  'Classic BLT (Bacon, Lettuce & Tomato) Sandwiches': {
    prepTime: '5 mins',
    cookTime: '10 mins',
    servings: '4 servings',
    difficulty: 'Quick',
    ingredients: [
      '8 slices Thick-cut smoked bacon, cooked crispy',
      '8 slices Sourdough or country white sandwich bread, toasted',
      '4-6 large Ripe tomato slices, seasoned with sea salt and black pepper',
      'Crisp romaine or butterhead lettuce leaves',
      '4 tbsp Real mayonnaise',
      'Kettle potato chips & dill pickle spears',
    ],
    instructions: [
      'Cook bacon in a skillet or 400°F oven until crispy; drain on paper towels.',
      'Toast bread slices until golden brown.',
      'Spread mayonnaise generously over toasted bread slices.',
      'Layer crispy bacon strips, seasoned ripe tomato slices, and fresh lettuce leaves.',
      'Top with second bread slice, cut in half diagonally with a serrated knife, and serve with chips and pickles!',
    ],
    substitutions: [
      'Turkey Bacon: Use crispy turkey bacon for a leaner sandwich.',
      'BLAT: Add ripe sliced avocado for a delicious twist!',
    ],
    notes: 'Crisp, smoky, and refreshing summer classic.',
  },
  'Crunchy Breakfast Cereal & Fresh Berries': {
    prepTime: '2 mins',
    cookTime: '0 mins',
    servings: '2-4 servings',
    difficulty: 'Quick',
    ingredients: [
      '2-4 cups Favorite cereal (Toasted oat loops, flakes, or granola)',
      '2-4 cups Cold whole milk, oat milk, or almond milk',
      '1 cup Fresh sliced strawberries, bananas, or blueberries',
      'Optional: Slices of warm buttered toast or hard-boiled eggs',
    ],
    instructions: [
      'Pour favorite cereal into family bowls.',
      'Top with fresh sliced strawberries, bananas, or blueberries.',
      'Pour ice-cold milk over the cereal right before eating for maximum crunch!',
      'Enjoy with warm buttered toast or fresh fruit on the side.',
    ],
    substitutions: [
      'Warm Oatmeal: Cook 1 cup rolled oats in 2 cups milk for 3 minutes for a hot cereal option.',
    ],
    notes: 'Quick, zero-fuss family comfort food for low-energy open nights.',
  },
  'Classic Spaghetti & Homestyle Meatballs': {
    prepTime: '20 mins',
    cookTime: '25 mins',
    servings: '4-6 servings',
    difficulty: 'Easy',
    ingredients: [
      '1 lb Spaghetti or linguine pasta',
      '1 lb Lean ground beef (or 50/50 mix of ground beef and mild Italian sausage)',
      '1/2 cup Italian seasoned breadcrumbs',
      '1/3 cup Freshly grated Parmesan cheese',
      '1 large Egg, beaten',
      '3 cloves Garlic, minced',
      '2 tbsp Fresh Italian parsley, finely chopped',
      '1 jar (24-28 oz) Marinara or crushed San Marzano tomato sauce (e.g. Rao\'s)',
      '2 tbsp Extra virgin olive oil',
      '1 tsp Dried Italian oregano & basil',
      'Salt and freshly ground black pepper to taste',
      'Fresh basil leaves and extra grated Parmesan for serving',
    ],
    instructions: [
      'In a large mixing bowl, gently combine ground meat, breadcrumbs, grated Parmesan, beaten egg, minced garlic, parsley, 1/2 tsp salt, and 1/4 tsp pepper. Mix gently until combined (gentle handling keeps meatballs juicy and tender).',
      'Roll meat mixture into 1.5-inch round meatballs (yields about 12-16 meatballs).',
      'Heat olive oil in a large deep skillet or Dutch oven over medium-high heat. Brown meatballs on all sides for 5-6 minutes.',
      'Pour marinara sauce over the browned meatballs. Bring to a gentle simmer, cover, and cook on low heat for 15-20 minutes until meatballs are thoroughly cooked (internal temperature 165°F).',
      'Meanwhile, bring a large pot of salted water to a boil. Cook spaghetti according to package instructions until al dente. Reserve 1/2 cup pasta water, then drain.',
      'Toss spaghetti with a ladle of warm marinara sauce. Serve in bowls topped with generous meatballs and sauce, freshly grated Parmesan, and fresh basil leaves!',
    ],
    substitutions: [
      'Turkey Meatballs: Swap beef with lean ground turkey or ground chicken.',
      'Gluten-Free: Use certified gluten-free spaghetti and gluten-free breadcrumbs.',
      'Vegetarian: Use plant-based meatballs or sautéed portobello mushrooms simmered in marinara sauce.',
      'Oven-Baked: Bake meatballs on a parchment-lined baking sheet at 400°F (200°C) for 15 minutes before simmering in sauce.',
    ],
    notes: 'A timeless family favorite! Delicious paired with toasted garlic bread and a fresh Caesar salad.',
  },
  'Classic Homestyle Baked Meat Lasagna': {
    prepTime: '25 mins',
    cookTime: '45 mins',
    servings: '6-8 servings',
    difficulty: 'Medium',
    ingredients: [
      '12 Lasagna noodles (boiled or oven-ready)',
      '1 lb Ground beef and 1/2 lb Italian pork sausage',
      '1 medium Yellow onion & 3 cloves garlic, minced',
      '1 jar (28 oz) Marinara sauce & 1 can (15 oz) crushed tomatoes',
      '15 oz Whole milk Ricotta cheese',
      '1 large Egg, beaten',
      '3 cups Shredded whole-milk Mozzarella cheese',
      '1 cup Freshly grated Parmesan cheese',
      '2 tbsp Fresh chopped parsley, 1 tsp Italian herb seasoning, salt and black pepper',
    ],
    instructions: [
      'Preheat oven to 375°F (190°C). In a large pot, brown ground beef, sausage, onion, and garlic over medium heat. Drain excess fat.',
      'Stir in marinara sauce, crushed tomatoes, and Italian herbs. Simmer meat sauce on low for 10 minutes.',
      'In a bowl, mix ricotta cheese, beaten egg, 1/2 cup grated Parmesan, chopped parsley, and a pinch of salt and pepper.',
      'In a 9x13-inch baking dish, spread 1 cup meat sauce on the bottom. Layer: 4 lasagna noodles, 1/3 of the ricotta mixture, 1 cup shredded mozzarella, and meat sauce.',
      'Repeat layers twice more, finishing with noodles topped with remaining meat sauce, mozzarella, and Parmesan.',
      'Cover loosely with foil (tented so cheese does not stick) and bake for 25 minutes. Uncover and bake 15-20 minutes until bubbling and golden. Rest 10 minutes before slicing!',
    ],
    substitutions: [
      'Vegetarian: Swap meat sauce with rich mushroom, spinach, and zucchini marinara.',
      'Gluten-Free: Use certified gluten-free lasagna sheets.',
    ],
    notes: 'Letting it rest for 10-15 minutes after baking makes cutting neat, square family slices easy.',
  },
  'Cheesy Baked Ziti with Mozzarella': {
    prepTime: '15 mins',
    cookTime: '25 mins',
    servings: '6 servings',
    difficulty: 'Easy',
    ingredients: [
      '1 lb Ziti or Penne rigate pasta',
      '1 lb Italian sausage or lean ground beef',
      '1 jar (28 oz) Marinara sauce',
      '15 oz Ricotta cheese or small curd cottage cheese',
      '2.5 cups Shredded Mozzarella cheese',
      '1/2 cup Grated Parmesan cheese',
      '1 tsp Italian seasoning, salt and black pepper',
      'Fresh chopped basil or parsley for garnish',
    ],
    instructions: [
      'Preheat oven to 375°F (190°C). Boil ziti in salted water until 1-2 minutes shy of al dente; drain.',
      'Brown sausage or ground beef in a skillet, drain fat, and stir in marinara sauce and Italian herbs.',
      'In a large bowl, combine cooked pasta, meat sauce, ricotta cheese, and 1 cup of mozzarella.',
      'Transfer mixture into a 9x13-inch baking dish. Top evenly with remaining 1.5 cups mozzarella and 1/2 cup Parmesan cheese.',
      'Bake uncovered for 20-25 minutes until the cheese is completely melted, bubbly, and lightly golden brown.',
      'Garnish with fresh chopped basil and serve hot with garlic knots!',
    ],
    substitutions: [
      'Vegetarian: Omit meat and add sautéed bell peppers, spinach, and mushrooms.',
      'Gluten-Free: Use gluten-free ziti or penne pasta.',
    ],
    notes: 'Perfect make-ahead family meal that reheats wonderfully the next day.',
  },
  'Warm Italian Meatball Subs with Provolone': {
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: '4 hearty subs',
    difficulty: 'Easy',
    ingredients: [
      '4 Bakery fresh Italian sub rolls or hoagie buns',
      '16 Prepared homestyle meatballs (beef, turkey, or pork)',
      '2 cups Warm marinara sauce',
      '8 slices Provolone cheese or shredded mozzarella',
      '2 tbsp Melted butter mixed with 1/4 tsp garlic powder',
      '2 tbsp Grated Parmesan and dried oregano',
    ],
    instructions: [
      'Preheat oven or toaster oven to 375°F (190°C).',
      'Simmer meatballs in warm marinara sauce until thoroughly heated through.',
      'Slice sub rolls lengthwise (without cutting all the way through). Brush inside with garlic butter.',
      'Nestle 4 saucy meatballs inside each roll. Spoon extra marinara over the top.',
      'Layer 2 slices of provolone cheese over each sub, and sprinkle with Parmesan and oregano.',
      'Bake on a baking sheet for 6-8 minutes until rolls are toasted and cheese is melted and bubbling.',
      'Serve warm with kettle chips or a fresh Italian chopped salad!',
    ],
    substitutions: [
      'Garlic Bread Style: Toast the buns under the broiler with garlic butter before stuffing.',
    ],
    notes: 'A stadium and pizzeria comfort food favorite made in under 20 minutes!',
  },
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
  'Gourmet 3-Cheese Grilled Cheese & Tomato Basil Soup': {
    prepTime: '10 mins',
    cookTime: '10 mins',
    servings: '4 servings',
    difficulty: 'Quick',
    ingredients: [
      '8 slices Sourdough or thick Texas toast bread',
      '8 slices Sharp Cheddar, Gruyère or Fontina, and Provolone cheese',
      '4 tbsp Salted butter, softened (or mayo for extra-crisp crust)',
      '1/2 tsp Garlic powder',
      'Tomato Soup: 1 can (28 oz) San Marzano crushed tomatoes, 1 cup vegetable broth, 1/3 cup heavy cream, 2 tbsp butter, fresh basil leaves, salt & pepper',
    ],
    instructions: [
      'For the soup: In a medium pot, combine crushed tomatoes and broth. Simmer for 10 minutes. Stir in butter and heavy cream. Season with salt, pepper, and torn fresh basil. Blend with immersion blender until smooth.',
      'For the grilled cheese: Butter one side of each bread slice generously and sprinkle lightly with garlic powder.',
      'Place bread buttered-side-down in a skillet over medium-low heat.',
      'Layer with sharp cheddar, fontina/gruyere, and provolone. Top with second bread slice, buttered-side-up.',
      'Grill for 3-4 minutes per side, gently pressing with a spatula, until the bread is deeply golden, crispy, and the cheese is fully melted and stretchy.',
      'Cut diagonally into triangles and serve hot for dipping into the velvety tomato basil soup!',
    ],
    substitutions: [
      'Add-ins: Crisp bacon strips, sliced ripe tomatoes, or caramelized onions.',
      'Gluten-Free: Use certified gluten-free sandwich bread.',
      'Dairy-Free: Use plant-based butter and vegan cheddar shreds.',
    ],
    notes: 'A timeless family comfort hit! Mayo on the outside crust gives a magical golden crunch.',
  },
  'Crispy Baked Chicken Tenders & Sweet Potato Fries': {
    prepTime: '15 mins',
    cookTime: '18 mins',
    servings: '4 servings',
    difficulty: 'Easy',
    ingredients: [
      '1.5 lbs Chicken tenderloins',
      '1.5 cups Panko breadcrumbs + 1/2 cup grated parmesan',
      '2 Eggs, beaten with 2 tbsp milk',
      '1/2 cup Flour seasoned with paprika, garlic powder, salt & pepper',
      '1 bag Frozen sweet potato waffle fries or 2 fresh sweet potatoes, cut into wedges',
      'Dipping Sauces: Honey mustard, ranch, and BBQ sauce',
    ],
    instructions: [
      'Preheat oven or air-fryer to 425°F (220°C). Line baking sheet with parchment.',
      'Set up 3 shallow bowls: 1) Flour & seasoning, 2) Beaten eggs, 3) Panko & parmesan.',
      'Dredge chicken tenders in flour, dip into egg wash, then press firmly into panko crumbs.',
      'Arrange tenders and sweet potato fries on the baking sheet in a single layer. Spray lightly with olive oil.',
      'Bake for 16-18 minutes (flipping halfway) until chicken is 165°F and crust is crunchy golden brown.',
      'Serve hot with a trio of honey mustard, ranch, and BBQ dipping sauces!',
    ],
    substitutions: [
      'Gluten-Free: Use GF flour and gluten-free panko breadcrumbs.',
    ],
    notes: 'Kids can help with the 3-step dredging station as junior sous chefs!',
  },
  'Baja Fish or Black Bean Tacos': {
    prepTime: '15 mins',
    cookTime: '10 mins',
    servings: '4-6 servings',
    difficulty: 'Easy',
    ingredients: [
      '1.5 lbs White fish fillets (Cod, Halibut, or Tilapia) or 2 cans Black Beans',
      '10-12 Small corn or flour tortillas',
      'Baja Slaw: 2 cups shredded cabbage, 2 tbsp mayo, 1 tbsp lime juice, pinch of sugar and salt',
      'Avocado Crema: 1 avocado blended with 1/3 cup sour cream, lime juice, and cilantro',
      'Seasoning: 1 tsp cumin, 1 tsp chili powder, garlic powder, salt & lime wedges',
    ],
    instructions: [
      'Season fish with cumin, chili powder, garlic powder, and salt.',
      'Pan-sear fish in 1 tbsp olive oil over medium-high heat for 3-4 minutes per side until flaky and slightly charred.',
      'Toss shredded cabbage with mayo, lime juice, and salt for the crunchy Baja slaw.',
      'Warm tortillas on a dry skillet or over an open flame for 30 seconds.',
      'Flake fish into tender chunks. Assemble tacos with fish, crunchy slaw, a drizzle of avocado crema, and fresh lime!',
    ],
    substitutions: [
      'Vegetarian: Warm seasoned black beans and roasted sweet corn instead of fish.',
    ],
    notes: 'Crisp, light, and zesty summer favorite for Taco Tuesday!',
  },
  'One-Pot Creamy Pesto Tortellini': {
    prepTime: '5 mins',
    cookTime: '15 mins',
    servings: '4-6 servings',
    difficulty: 'Quick',
    ingredients: [
      '1 lb Refrigerated three-cheese tortellini',
      '1/2 cup Basil pesto (jarred or fresh)',
      '1 cup Heavy cream or half-and-half',
      '1.5 cups Cherry tomatoes, halved',
      '2 cups Fresh baby spinach',
      '1/2 cup Freshly grated parmesan cheese',
      '1 tbsp Olive oil & 2 cloves minced garlic',
    ],
    instructions: [
      'Boil cheese tortellini in salted water for 3-4 minutes until tender; drain.',
      'In the same warm pot, heat 1 tbsp olive oil and sauté minced garlic for 30 seconds.',
      'Pour in heavy cream and basil pesto, whisking over low heat until smooth and warmed through.',
      'Fold in cooked tortellini, halved cherry tomatoes, and fresh baby spinach. Stir until spinach wilts (about 2 minutes).',
      'Stir in grated parmesan cheese and season with cracked black pepper. Serve with warm crusty garlic bread!',
    ],
    substitutions: [
      'Add-in: Sliced grilled chicken or sautéed shrimp.',
      'Nut-Free: Use nut-free pumpkin seed pesto.',
    ],
    notes: 'One single pot to wash and ready in only 15 minutes!',
  },
};

export interface RecipeSearchResult {
  recipe: MealRecipe;
  matchedTitle: string;
  suggestedSides?: string;
  suggestedDessert?: string;
  suggestedTheme?: string;
  suggestedIcon?: string;
  matchType: 'exact' | 'fuzzy' | 'custom';
}

/**
 * High-precision recipe search engine.
 * Takes user input query (e.g. "Grilled Cheese", "Tacos", "Chicken Alfredo") and
 * searches the catalog or dynamically synthesizes a complete, detailed recipe.
 */
export const searchRecipeForDish = (query: string, currentTheme?: string): RecipeSearchResult => {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return {
      recipe: {
        prepTime: '15 mins',
        cookTime: '20 mins',
        servings: '4-6 servings',
        difficulty: 'Easy',
        ingredients: ['1.5 lbs Main protein or pasta base', '2 cups Garden vegetables', '2 tbsp Butter or olive oil', 'Seasonings to taste'],
        instructions: ['Preheat cooking surface.', 'Cook protein and veggies until tender.', 'Season and serve warm!'],
      },
      matchedTitle: 'Quick Family Dinner',
      matchType: 'custom',
    };
  }

  const lower = trimmed.toLowerCase();

  // 1. Exact Match
  for (const [key, recipe] of Object.entries(RECIPE_PRESETS_DATABASE)) {
    if (key.toLowerCase() === lower) {
      return {
        recipe,
        matchedTitle: key,
        matchType: 'exact',
      };
    }
  }

  // 2. Specific keyword matches
  // Peanut Butter and Jelly / PB&J / Nut Butters
  if (
    lower.includes('peanut butter') ||
    lower.includes('pb&j') ||
    lower.includes('pb & j') ||
    lower.includes('pbj') ||
    (lower.includes('jelly') && (lower.includes('bread') || lower.includes('sandwich'))) ||
    lower === 'peanut butter' ||
    lower === 'pb and j' ||
    lower === 'peanut butter and jelly'
  ) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Peanut Butter and Jelly Sandwich (PB&J)'],
      matchedTitle: 'Peanut Butter and Jelly Sandwich (PB&J)',
      suggestedSides: 'Crisp Baby Carrots, Sliced Apples & Cold Milk',
      suggestedDessert: 'Chocolate Chip Cookie',
      suggestedTheme: 'Casual Sandwich Night 🥪',
      suggestedIcon: '🥪',
      matchType: 'fuzzy',
    };
  }

  // Pancakes & Breakfast-for-Dinner
  if (lower.includes('pancake') || lower.includes('waffle') || lower.includes('french toast') || lower.includes('breakfast for dinner')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Fluffy Buttermilk Pancakes (Breakfast-for-Dinner)'],
      matchedTitle: 'Fluffy Buttermilk Pancakes (Breakfast-for-Dinner)',
      suggestedSides: 'Crispy Bacon Strips & Sliced Fresh Strawberries',
      suggestedDessert: 'Warm Maple Doughnut Bites',
      suggestedTheme: 'Breakfast-for-Dinner Night! 🥞',
      suggestedIcon: '🥞',
      matchType: 'fuzzy',
    };
  }

  // Hot Dogs
  if (lower.includes('hot dog') || lower.includes('hotdog') || lower.includes('corn dog') || lower.includes('frankfurter') || lower.includes('bratwurst')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Classic Hot Dogs & Crispy French Fries'],
      matchedTitle: 'Classic Hot Dogs & Crispy French Fries',
      suggestedSides: 'Crispy French Fries & Sweet Corn on the Cob',
      suggestedDessert: 'Ice Cream Sandwiches',
      suggestedTheme: 'Boardwalk Hot Dog Night 🌭',
      suggestedIcon: '🌭',
      matchType: 'fuzzy',
    };
  }

  // Sloppy Joes
  if (lower.includes('sloppy') || lower.includes('manwich')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Homestyle Sloppy Joes on Toasted Buns'],
      matchedTitle: 'Homestyle Sloppy Joes on Toasted Buns',
      suggestedSides: 'Crispy Tater Tots & Creamy Coleslaw',
      suggestedDessert: 'Fudgy Brownie Bites',
      suggestedTheme: 'Homestyle Sloppy Joe Night 🥪',
      suggestedIcon: '🥪',
      matchType: 'fuzzy',
    };
  }

  // Quesadillas
  if (lower.includes('quesadilla')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Cheesy Crispy Quesadillas with Salsa & Guac'],
      matchedTitle: 'Cheesy Crispy Quesadillas with Salsa & Guac',
      suggestedSides: 'Tortilla Chips, Salsa & Sweet Corn Salad',
      suggestedDessert: 'Cinnamon Churro Sticks',
      suggestedTheme: 'Cheesy Quesadilla Fiesta! 🧀',
      suggestedIcon: '🧀',
      matchType: 'fuzzy',
    };
  }

  // BLT Sandwiches
  if (lower.includes('blt')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Classic BLT (Bacon, Lettuce & Tomato) Sandwiches'],
      matchedTitle: 'Classic BLT (Bacon, Lettuce & Tomato) Sandwiches',
      suggestedSides: 'Crunchy Kettle Potato Chips & Dill Pickles',
      suggestedDessert: 'Fresh Watermelon Wedges',
      suggestedTheme: 'Crispy BLT Sandwich Night 🥪',
      suggestedIcon: '🥪',
      matchType: 'fuzzy',
    };
  }

  // Cold Deli Sandwiches & Clubs
  if (lower.includes('deli') || lower.includes('turkey sandwich') || lower.includes('ham sandwich') || lower.includes('club sandwich') || lower.includes('sub sandwich') || lower.includes('hoagie')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Deli Turkey, Ham & Cheddar Club Sandwiches'],
      matchedTitle: 'Deli Turkey, Ham & Cheddar Club Sandwiches',
      suggestedSides: 'Crunchy Potato Chips & Crisp Pickle Spears',
      suggestedDessert: 'Oatmeal Raisin Cookie',
      suggestedTheme: 'Deli Club Sandwich Night 🥪',
      suggestedIcon: '🥪',
      matchType: 'fuzzy',
    };
  }

  // Breakfast Cereal & Oatmeal
  if (lower.includes('cereal') || lower.includes('oatmeal')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Crunchy Breakfast Cereal & Fresh Berries'],
      matchedTitle: 'Crunchy Breakfast Cereal & Fresh Berries',
      suggestedSides: 'Warm Buttered Toast & Sliced Bananas',
      suggestedDessert: 'Fresh Berry Yogurt Parfait',
      suggestedTheme: 'Cozy Cereal Bowl Night 🥣',
      suggestedIcon: '🥣',
      matchType: 'fuzzy',
    };
  }

  // Grilled Cheese
  if (lower.includes('grilled cheese') || (lower.includes('cheese') && lower.includes('sandwich'))) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Gourmet 3-Cheese Grilled Cheese & Tomato Basil Soup'],
      matchedTitle: 'Gourmet 3-Cheese Grilled Cheese & Tomato Basil Soup',
      suggestedSides: 'Creamy Tomato Basil Soup & Crispy Kettle Chips',
      suggestedDessert: 'Chocolate Chip Cookie Bites',
      suggestedTheme: 'Comfort Sandwich Night 🥪',
      suggestedIcon: '🥪',
      matchType: 'fuzzy',
    };
  }

  // Chicken Tenders & Nuggets
  if (lower.includes('tender') || lower.includes('nugget') || (lower.includes('chicken') && lower.includes('finger'))) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Crispy Baked Chicken Tenders & Sweet Potato Fries'],
      matchedTitle: 'Crispy Baked Chicken Tenders & Sweet Potato Fries',
      suggestedSides: 'Crispy Sweet Potato Fries & Fresh Cucumber Slices',
      suggestedDessert: 'Fruit Popsicles',
      suggestedTheme: 'Kids\' Choice Crispy Night 🍗',
      suggestedIcon: '🍗',
      matchType: 'fuzzy',
    };
  }

  // Tortellini & Pesto
  if (lower.includes('tortellini') || lower.includes('pesto')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['One-Pot Creamy Pesto Tortellini'],
      matchedTitle: 'One-Pot Creamy Pesto Tortellini',
      suggestedSides: 'Warm Garlic Bread & Blistered Cherry Tomatoes',
      suggestedDessert: 'Lemon Sorbet',
      suggestedTheme: 'Italian Quick Pasta Night 🥟',
      suggestedIcon: '🥟',
      matchType: 'fuzzy',
    };
  }

  // Fish Tacos
  if (lower.includes('fish taco') || lower.includes('baja') || lower.includes('shrimp taco')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Baja Fish or Black Bean Tacos'],
      matchedTitle: 'Baja Fish or Black Bean Tacos',
      suggestedSides: 'Crunchy Baja Lime Slaw, Cilantro Rice & Black Beans',
      suggestedDessert: 'Cinnamon Sugar Churros',
      suggestedTheme: 'Baja Taco Fiesta! 🌮',
      suggestedIcon: '🌮',
      matchType: 'fuzzy',
    };
  }

  // Tacos, Fajitas & Burritos
  if (lower.includes('taco') || lower.includes('fajita') || lower.includes('burrito') || lower.includes('enchilada') || lower.includes('mexican')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Loaded Build-Your-Own Taco Bar'],
      matchedTitle: 'Loaded Build-Your-Own Taco Bar',
      suggestedSides: 'Cilantro Lime Rice, Black Beans & Fresh Guacamole',
      suggestedDessert: 'Warm Cinnamon Sugar Churro Bites',
      suggestedTheme: 'Taco Tuesday Fiesta! 🌮',
      suggestedIcon: '🌮',
      matchType: 'fuzzy',
    };
  }

  // Pizza & Flatbreads
  if (lower.includes('pizza') || lower.includes('flatbread') || lower.includes('calzone')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Brick-Oven Style Pepperoni & Cheese Pizzas'],
      matchedTitle: 'Brick-Oven Style Pepperoni & Cheese Pizzas',
      suggestedSides: 'Crispy Veggie Sticks with Ranch & Garlic Breadsticks',
      suggestedDessert: 'Ice Cream Sundaes with Sprinkles',
      suggestedTheme: 'Pizza & Movie Night! 🍕🎬',
      suggestedIcon: '🍕',
      matchType: 'fuzzy',
    };
  }

  // Burgers & Sliders
  if (lower.includes('burger') || lower.includes('slider') || lower.includes('smashburger')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Gourmet Cheddar Smash Burgers'],
      matchedTitle: 'Gourmet Cheddar Smash Burgers',
      suggestedSides: 'Crispy Sweet Potato Fries & Sweet Corn on the Cob',
      suggestedDessert: 'All-Natural Fruit Pops',
      suggestedTheme: 'Grill & Chill Smashburgers 🍔',
      suggestedIcon: '🍔',
      matchType: 'fuzzy',
    };
  }

  // Spaghetti, Meatballs & Bolognese
  if (
    lower.includes('spaghetti') ||
    (lower.includes('meatball') && !lower.includes('sub') && !lower.includes('sandwich') && !lower.includes('hoagie') && !lower.includes('hero') && !lower.includes('slider')) ||
    lower.includes('bolognese') ||
    lower.includes('marinara') ||
    lower.includes('meat sauce') ||
    (lower.includes('pasta') && lower.includes('meat'))
  ) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Classic Spaghetti & Homestyle Meatballs'],
      matchedTitle: 'Classic Spaghetti & Homestyle Meatballs',
      suggestedSides: 'Warm Garlic Bread & Garden Caesar Salad',
      suggestedDessert: 'Italian Gelato or Tiramisu',
      suggestedTheme: 'Italian Spaghetti Feast 🍝',
      suggestedIcon: '🍝',
      matchType: 'fuzzy',
    };
  }

  // Meatball Subs & Sandwiches
  if (
    lower.includes('meatball') &&
    (lower.includes('sub') || lower.includes('sandwich') || lower.includes('hoagie') || lower.includes('hero') || lower.includes('slider') || lower.includes('roll'))
  ) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Warm Italian Meatball Subs with Provolone'],
      matchedTitle: 'Warm Italian Meatball Subs with Provolone',
      suggestedSides: 'Crispy Kettle Potato Chips & Caesar Salad',
      suggestedDessert: 'Chocolate Chip Cookies',
      suggestedTheme: 'Warm Meatball Sub Night 🥪',
      suggestedIcon: '🥪',
      matchType: 'fuzzy',
    };
  }

  // Lasagna
  if (lower.includes('lasagna') || lower.includes('lasagne')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Classic Homestyle Baked Meat Lasagna'],
      matchedTitle: 'Classic Homestyle Baked Meat Lasagna',
      suggestedSides: 'Toasted Garlic Herb Focaccia & Italian Garden Salad',
      suggestedDessert: 'Crispy Cinnamon Cannoli',
      suggestedTheme: 'Homestyle Lasagna Night 🍝',
      suggestedIcon: '🍝',
      matchType: 'fuzzy',
    };
  }

  // Baked Ziti & Penne
  if (lower.includes('ziti') || lower.includes('penne') || lower.includes('baked pasta') || lower.includes('mostaccioli')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Cheesy Baked Ziti with Mozzarella'],
      matchedTitle: 'Cheesy Baked Ziti with Mozzarella',
      suggestedSides: 'Warm Garlic Knots & Crisp Mixed Greens',
      suggestedDessert: 'Italian Lemon Ice',
      suggestedTheme: 'Cheesy Baked Pasta Night 🍝',
      suggestedIcon: '🍝',
      matchType: 'fuzzy',
    };
  }

  // Alfredo & Carbonara
  if (lower.includes('alfredo') || lower.includes('carbonara')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Creamy Garlic Chicken Alfredo Pasta'],
      matchedTitle: 'Creamy Garlic Chicken Alfredo Pasta',
      suggestedSides: 'Toasted Garlic Bread & Garden Caesar Salad',
      suggestedDessert: 'Fresh Strawberry Bowl',
      suggestedTheme: 'Italian Comfort Night 🍝',
      suggestedIcon: '🍝',
      matchType: 'fuzzy',
    };
  }

  // Mac & Cheese
  if (lower.includes('mac') || lower.includes('macaroni') || (lower.includes('cheese') && lower.includes('pasta'))) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Macaroni & Cheese with Crispy Panko'],
      matchedTitle: 'Macaroni & Cheese with Crispy Panko',
      suggestedSides: 'Steamed Broccoli Florets & Cinnamon Applesauce',
      suggestedDessert: 'Warm Chocolate Chip Cookies',
      suggestedTheme: 'Comfort Cheese Feast 🧀',
      suggestedIcon: '🧀',
      matchType: 'fuzzy',
    };
  }

  // BBQ & Pulled Pork
  if (lower.includes('bbq') || lower.includes('pulled pork') || lower.includes('ribs') || lower.includes('brisket')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Tender Pulled Pork / BBQ Jackfruit Sandwiches'],
      matchedTitle: 'Tender Pulled Pork / BBQ Jackfruit Sandwiches',
      suggestedSides: 'Creamy Homestyle Coleslaw & Baked Brown Sugar Beans',
      suggestedDessert: 'Warm Dutch Apple Pie Slice',
      suggestedTheme: 'Weekend Slow-Cooker BBQ 🥪',
      suggestedIcon: '🥪',
      matchType: 'fuzzy',
    };
  }

  // Salmon & Teriyaki
  if (lower.includes('salmon') || lower.includes('teriyaki') || lower.includes('tofu') || lower.includes('stir-fry') || lower.includes('rice bowl') || lower.includes('poke')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Teriyaki Salmon & Crispy Tofu Bowls'],
      matchedTitle: 'Teriyaki Salmon & Crispy Tofu Bowls',
      suggestedSides: 'Steamed Jasmine Rice & Garlic Butter Edamame',
      suggestedDessert: 'Mini Mochi Ice Cream Treats',
      suggestedTheme: 'Stir-Fry & Noodle Bowls 🥢',
      suggestedIcon: '🍣',
      matchType: 'fuzzy',
    };
  }

  // Shepherd's Pie / Stews / Pot Roast
  if (lower.includes('pot roast') || lower.includes('shepherd') || lower.includes('stew') || lower.includes('pot pie') || lower.includes('beef stew')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Classic Shepherd\'s Pie with Creamy Potato Crust'],
      matchedTitle: 'Classic Shepherd\'s Pie with Creamy Potato Crust',
      suggestedSides: 'Honey Glazed Baby Carrots & Buttered Sweet Peas',
      suggestedDessert: 'Warm Berry Crumble',
      suggestedTheme: 'Sunday Comfort Food Feast 🍲',
      suggestedIcon: '🥧',
      matchType: 'fuzzy',
    };
  }

  // Roast Chicken
  if (lower.includes('chicken') || lower.includes('roast') || lower.includes('drumstick') || lower.includes('thigh')) {
    return {
      recipe: RECIPE_PRESETS_DATABASE['Herb Roasted Chicken & Golden Crispy Potatoes'],
      matchedTitle: 'Herb Roasted Chicken & Golden Crispy Potatoes',
      suggestedSides: 'Buttery Golden Mashed Potatoes & Honey Glazed Carrots',
      suggestedDessert: 'Warm Chocolate Chip Cookies',
      suggestedTheme: 'Sunday Homestyle Roast 🍗',
      suggestedIcon: '🍗',
      matchType: 'fuzzy',
    };
  }

  // 3. Smart Category-Based Dynamic Generator for Any Custom Dish
  // A. Cold Sandwiches, Wraps, Spreads & No-Cook Meals
  if (
    lower.includes('sandwich') ||
    lower.includes('wrap') ||
    lower.includes('spread') ||
    lower.includes('roll-up') ||
    lower.includes('toast') ||
    lower.includes('bagel') ||
    lower.includes('sub') ||
    lower.includes('hoagie') ||
    lower.includes('pita') ||
    lower.includes('butter') ||
    lower.includes('jam') ||
    lower.includes('jelly') ||
    lower.includes('nutella')
  ) {
    const coldSandwichRecipe: MealRecipe = {
      prepTime: '5 mins',
      cookTime: '0 mins',
      servings: '2-4 servings',
      difficulty: 'Quick',
      ingredients: [
        `4-8 slices Fresh sandwich bread, rolls, or wraps for ${trimmed}`,
        `1-2 cups Main filling, spread, or deli protein for ${trimmed}`,
        'Fresh crisp lettuce, sliced ripe tomatoes, or fruit slices (as appropriate)',
        '2-4 tbsp Condiments or sweet spreads (mayo, mustard, butter, or jelly)',
        'Sides: Crunchy kettle chips, baby carrots, or fresh fruit slices',
      ],
      instructions: [
        `Lay bread slices, rolls, or tortillas out flat on a clean cutting board or plate.`,
        'Spread condiments or spreads evenly across bread surfaces from edge to edge.',
        `Layer the main filling for ${trimmed} and fresh toppings evenly across the base slice.`,
        'Close with the top bread slice, press gently, and slice diagonally into triangles or halves.',
        'Serve fresh and cool with crisp family sides and refreshing drinks!',
      ],
      substitutions: [
        'Gluten-Free: Use certified gluten-free sandwich bread or large lettuce wraps.',
        'Plant-Based: Use dairy-free spreads and plant-based protein or nut/seed butters.',
      ],
      notes: `Quick no-cook preparation tailored for ${trimmed}. Perfect for easy weeknights and lunches!`,
    };

    return {
      recipe: coldSandwichRecipe,
      matchedTitle: trimmed,
      suggestedSides: 'Crunchy Potato Chips, Crisp Baby Carrots & Fresh Fruit',
      suggestedDessert: 'Soft-Baked Chocolate Chip Cookies',
      suggestedTheme: currentTheme || `${trimmed} Sandwich Night 🥪`,
      suggestedIcon: '🥪',
      matchType: 'custom',
    };
  }

  // B. Fresh Salads & Cold Bowls
  if (lower.includes('salad') || lower.includes('greens') || lower.includes('cobb') || lower.includes('caesar') || lower.includes('coleslaw')) {
    const saladRecipe: MealRecipe = {
      prepTime: '10 mins',
      cookTime: '0 mins',
      servings: '4 servings',
      difficulty: 'Quick',
      ingredients: [
        '6 cups Fresh crisp greens (romaine, baby spinach, or mixed spring greens)',
        `1.5 cups Prepared protein or topping for ${trimmed}`,
        '1 cup Cherry tomatoes, cucumbers, bell peppers, or shredded carrots',
        '1/2 cup Shredded cheese, nuts, seeds, or seasoned croutons',
        '1/3 cup Family favorite dressing (ranch, vinaigrette, or Caesar)',
      ],
      instructions: [
        'Wash and dry salad greens thoroughly; chop into bite-sized pieces.',
        'In a large salad bowl, layer greens with fresh vegetables and toppings.',
        `Add the main protein/toppings for ${trimmed}.`,
        'Drizzle lightly with dressing just before serving, or serve dressing on the side.',
        'Toss gently with salad tongs and garnish with croutons and freshly cracked pepper!',
      ],
      substitutions: [
        'Dairy-Free: Use an olive oil & lemon vinaigrette and omit cheese.',
      ],
      notes: `Crisp, vibrant, and refreshing ${trimmed} salad ready in 10 minutes.`,
    };

    return {
      recipe: saladRecipe,
      matchedTitle: trimmed,
      suggestedSides: 'Warm Garlic Breadsticks or Sourdough Rolls',
      suggestedDessert: 'Fresh Seasonal Fruit Bowl',
      suggestedTheme: currentTheme || `${trimmed} Salad Night 🥗`,
      suggestedIcon: '🥗',
      matchType: 'custom',
    };
  }

  // C. Soups, Chilis & Stews
  if (lower.includes('soup') || lower.includes('chili') || lower.includes('chowder') || lower.includes('stew') || lower.includes('bisque') || lower.includes('broth')) {
    const soupRecipe: MealRecipe = {
      prepTime: '10 mins',
      cookTime: '25 mins',
      servings: '4-6 servings',
      difficulty: 'Easy',
      ingredients: [
        `1.5 lbs Base ingredients or protein for ${trimmed}`,
        '4 cups Savory broth (vegetable, chicken, or beef stock)',
        '1 diced onion, 2 cloves garlic & 1 cup diced celery and carrots',
        '2 tbsp Butter or olive oil & 1 tsp herbs (thyme, oregano, bay leaf)',
        'Salt and cracked black pepper to taste',
        'Crusty artisan bread or oyster crackers for dipping',
      ],
      instructions: [
        'Melt butter or warm olive oil in a large heavy soup pot over medium heat.',
        'Add diced onions, garlic, celery, and carrots; sauté for 5 minutes until soft and fragrant.',
        `Add main ingredients for ${trimmed}, pour in broth, and stir in herbs, salt, and pepper.`,
        'Bring to a boil, then reduce heat to low, cover with lid, and simmer gently for 20 minutes.',
        'Ladle piping hot into soup bowls and serve with warm crusty bread for dipping!',
      ],
      substitutions: [
        'Gluten-Free: Ensure broth is certified gluten-free and serve with GF crackers.',
      ],
      notes: `Cozy, warming, and comforting one-pot ${trimmed}!`,
    };

    return {
      recipe: soupRecipe,
      matchedTitle: trimmed,
      suggestedSides: 'Warm Crusty Sourdough Bread & Buttered Sweet Corn',
      suggestedDessert: 'Cinnamon Apple Crisp',
      suggestedTheme: currentTheme || `Cozy ${trimmed} Soup Night 🍲`,
      suggestedIcon: '🍲',
      matchType: 'custom',
    };
  }

  // D. Pasta, Macaroni & Noodles
  if (lower.includes('pasta') || lower.includes('noodle') || lower.includes('penne') || lower.includes('linguine') || lower.includes('spaghetti') || lower.includes('ravioli') || lower.includes('ramen')) {
    const pastaRecipe: MealRecipe = {
      prepTime: '10 mins',
      cookTime: '15 mins',
      servings: '4-6 servings',
      difficulty: 'Easy',
      ingredients: [
        '1 lb Quality pasta or noodles',
        `2 cups Savory sauce or protein base for ${trimmed}`,
        '2 tbsp Olive oil or butter & 2 cloves minced garlic',
        '1/2 cup Freshly grated Parmesan cheese',
        'Fresh herbs (basil or parsley), sea salt & black pepper',
      ],
      instructions: [
        'Bring a large pot of salted water to a rolling boil. Cook pasta al dente according to package instructions; reserve 1/2 cup pasta water, then drain.',
        `In a large warm skillet, prepare and heat the sauce/protein for ${trimmed} with garlic and olive oil.`,
        'Toss the drained pasta directly into the sauce, splashing in reserved pasta water as needed for a glossy coating.',
        'Simmer together for 1-2 minutes so pasta absorbs flavor.',
        'Garnish with freshly grated Parmesan and chopped herbs; serve warm with garlic bread!',
      ],
      substitutions: [
        'Gluten-Free: Swap with 1-to-1 certified gluten-free pasta.',
      ],
      notes: `Delicious Italian-style ${trimmed} loved by the entire family!`,
    };

    return {
      recipe: pastaRecipe,
      matchedTitle: trimmed,
      suggestedSides: 'Toasted Garlic Bread & Crisp Caesar Salad',
      suggestedDessert: 'Italian Gelato or Strawberry Bites',
      suggestedTheme: currentTheme || `${trimmed} Pasta Night 🍝`,
      suggestedIcon: '🍝',
      matchType: 'custom',
    };
  }

  // E. Mexican, Tacos & Bowls
  if (lower.includes('taco') || lower.includes('burrito') || lower.includes('fajita') || lower.includes('enchilada') || lower.includes('mexican') || lower.includes('nacho')) {
    const mexicanRecipe: MealRecipe = {
      prepTime: '10 mins',
      cookTime: '12 mins',
      servings: '4-6 servings',
      difficulty: 'Easy',
      ingredients: [
        `1.5 lbs Seasoned protein, beans, or filling for ${trimmed}`,
        '8-10 Warm tortillas or crispy corn shells',
        '1.5 cups Shredded Mexican blend or Cheddar cheese',
        'Fresh toppings: Shredded lettuce, diced ripe tomatoes, sour cream & salsa',
        'Fresh lime wedges & chopped cilantro',
      ],
      instructions: [
        `Cook and season the main filling for ${trimmed} in a skillet over medium heat until savory and heated through.`,
        'Warm tortillas or taco shells in a dry skillet or low oven for 2 minutes.',
        'Set out all toppings in small colorful family bowls.',
        'Assemble tacos/burritos with filling, cheese, crisp vegetables, and a spoonful of salsa.',
        'Squeeze fresh lime on top and enjoy warm with family sides!',
      ],
      substitutions: [
        'Vegetarian: Use seasoned black beans, pinto beans, or roasted sweet potatoes.',
      ],
      notes: `Festive and customizable ${trimmed} where everyone builds their own plate!`,
    };

    return {
      recipe: mexicanRecipe,
      matchedTitle: trimmed,
      suggestedSides: 'Cilantro Lime Rice, Black Beans & Tortilla Chips with Guacamole',
      suggestedDessert: 'Cinnamon Sugar Churro Bites',
      suggestedTheme: currentTheme || `${trimmed} Fiesta! 🌮`,
      suggestedIcon: '🌮',
      matchType: 'custom',
    };
  }

  // F. General Hot Skillet / Oven Dinner
  const dynamicRecipe: MealRecipe = {
    prepTime: '12 mins',
    cookTime: '18 mins',
    servings: '4-6 servings',
    difficulty: 'Easy',
    ingredients: [
      `1.5 lbs Main ingredients or protein for ${trimmed}`,
      '2 cups Choice of fresh vegetables (broccoli, carrots, green beans, or sweet peas)',
      '2 tbsp Butter or olive oil',
      'Seasoning blend: 1 tsp garlic powder, sea salt, black pepper, and herbs to taste',
      'Complimentary sauce, gravy, or pan juices to coat',
    ],
    instructions: [
      `Prepare ingredients for ${trimmed}.`,
      'Warm butter or olive oil in a skillet over medium heat or preheat oven to 400°F.',
      `Cook the main dish for ${trimmed} with seasonings until tender, flavorful, and cooked through.`,
      'Steam or roast side vegetables until tender-crisp.',
      'Plate warm, drizzle with pan sauce, and serve with family favorite side dishes!',
    ],
    substitutions: [
      'Dietary Adjustments: Check all seasonings and sauces for allergens as needed.',
    ],
    notes: `Custom recipe synthesized for ${trimmed}. Adjust seasonings to match your family\'s taste!`,
  };

  return {
    recipe: dynamicRecipe,
    matchedTitle: trimmed,
    suggestedSides: 'Garden Green Salad & Buttery Dinner Rolls',
    suggestedDessert: 'Fresh Seasonal Fruit & Warm Cookies',
    suggestedTheme: currentTheme || `${trimmed} Family Night 🍽️`,
    suggestedIcon: '🍲',
    matchType: 'custom',
  };
};

/**
 * Intelligent helper to provide a step-by-step comprehensible recipe for any dish title.
 */
export const getRecipeForDish = (dishTitle: string, theme?: string): MealRecipe => {
  return searchRecipeForDish(dishTitle, theme).recipe;
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
