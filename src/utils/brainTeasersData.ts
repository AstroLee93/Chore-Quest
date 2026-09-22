import { GradeLevel } from '../types';

export interface BrainTeaser {
  id: string;
  gradeLevel: GradeLevel;
  subject: 'math' | 'science' | 'wordplay' | 'logic' | 'nature' | 'riddle';
  subjectLabel: string;
  subjectIcon: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  hint: string;
  thinkingAngle?: string;
  funFactExplanation: string;
  isAiGenerated?: boolean;
  conceptTag?: string;
}

export const BRAIN_TEASERS_CATALOG: BrainTeaser[] = [
  {
    "id": "k-1",
    "gradeLevel": "kindergarten",
    "subject": "math",
    "subjectLabel": "Pond Counting",
    "subjectIcon": "🦆",
    "question": "There are 4 little yellow ducklings swimming in a pond. 2 more ducklings jump in with a splash! How many ducklings are swimming now?",
    "options": [
      "5 ducklings",
      "6 ducklings",
      "7 ducklings",
      "4 ducklings"
    ],
    "correctAnswerIndex": 1,
    "hint": "Put 4 fingers up on one hand, then raise 2 more fingers and count them together!",
    "thinkingAngle": "Counting On: Start at 4 and count up: 5, 6!",
    "funFactExplanation": "Splash-tastic! 4 + 2 = 6 ducklings. Did you know duck feathers are naturally waterproof so they stay warm and dry even underwater!"
  },
  {
    "id": "k-2",
    "gradeLevel": "kindergarten",
    "subject": "math",
    "subjectLabel": "Star Counting",
    "subjectIcon": "⭐",
    "question": "You have 5 shiny star stickers on your chart. You give 2 stickers to your best friend. How many stickers do you have left?",
    "options": [
      "2 stickers",
      "3 stickers",
      "4 stickers",
      "5 stickers"
    ],
    "correctAnswerIndex": 1,
    "hint": "Imagine having 5 stars and taking away 2. How many are still on your paper?",
    "thinkingAngle": "Takeaway Math: When you share or give away items, your group gets smaller.",
    "funFactExplanation": "Spot on! 5 - 2 = 3 stickers left. Real stars in the night sky twinkle because their light travels through moving air around our planet!"
  },
  {
    "id": "k-3",
    "gradeLevel": "kindergarten",
    "subject": "math",
    "subjectLabel": "Shape Explorer",
    "subjectIcon": "🔺",
    "question": "Which shape has exactly 3 straight sides and 3 pointy corners?",
    "options": [
      "A Circle",
      "A Square",
      "A Triangle",
      "A Rectangle"
    ],
    "correctAnswerIndex": 2,
    "hint": "Think of a slice of pizza or the roof of a house!",
    "thinkingAngle": "Counting Sides: Circles have 0 straight sides, squares have 4, but this shape has only 3.",
    "funFactExplanation": "Wonderful! A triangle always has 3 sides and 3 corners. The word \"tri\" comes from an ancient word meaning three, just like a tricycle has 3 wheels!"
  },
  {
    "id": "k-4",
    "gradeLevel": "kindergarten",
    "subject": "nature",
    "subjectLabel": "Baby Animals",
    "subjectIcon": "🐱",
    "question": "What is the special name for a baby cat?",
    "options": [
      "A Puppy",
      "A Kitten",
      "A Calf",
      "A Cub"
    ],
    "correctAnswerIndex": 1,
    "hint": "It starts with the letter K and loves to play with yarn balls and purr!",
    "thinkingAngle": "Animal Names: Dogs have puppies, bears have cubs, and cats have kittens.",
    "funFactExplanation": "Purr-fect! A baby cat is called a kitten. Kittens are born with their eyes closed and open them after about ten days!"
  },
  {
    "id": "k-5",
    "gradeLevel": "kindergarten",
    "subject": "nature",
    "subjectLabel": "Ocean Friends",
    "subjectIcon": "🐬",
    "question": "Where do wild dolphins and colorful clownfish live?",
    "options": [
      "In a Sandbox",
      "High in Trees",
      "In the Ocean",
      "On a Mountain Top"
    ],
    "correctAnswerIndex": 2,
    "hint": "Think of where you see big waves, salty water, and coral reefs.",
    "thinkingAngle": "Habitats: Every animal has a special home where it finds food, water, and shelter.",
    "funFactExplanation": "Great discovery! Dolphins and fish live in the ocean. Even though dolphins swim in the sea, they breathe air through a blowhole on top of their head!"
  },
  {
    "id": "k-6",
    "gradeLevel": "kindergarten",
    "subject": "nature",
    "subjectLabel": "Busy Bees",
    "subjectIcon": "🐝",
    "question": "What sweet, golden food do honeybees make inside their hives?",
    "options": [
      "Peanut Butter",
      "Honey",
      "Maple Syrup",
      "Chocolate"
    ],
    "correctAnswerIndex": 1,
    "hint": "It is made from flower nectar and tastes delicious on warm toast or in tea.",
    "thinkingAngle": "Animal Helpers: Bees visit colorful flowers to collect sweet nectar.",
    "funFactExplanation": "Buzztastic! Bees make honey. Honey is one of the only natural foods on Earth that never spoils, even after hundreds of years!"
  },
  {
    "id": "k-7",
    "gradeLevel": "kindergarten",
    "subject": "science",
    "subjectLabel": "Sky Wonders",
    "subjectIcon": "🌈",
    "question": "What colorful arc appears across the sky when sunlight shines through falling rain?",
    "options": [
      "A Rainbow",
      "A Cloud",
      "A Tornado",
      "The Moon"
    ],
    "correctAnswerIndex": 0,
    "hint": "It has red, orange, yellow, green, blue, and purple bands in a giant curve.",
    "thinkingAngle": "Light & Water: Tiny raindrops act like little prisms that bend white sunlight into all its hidden colors.",
    "funFactExplanation": "Brilliant! A rainbow is made of refracted light. Every raindrop bends sunlight into a circle—we usually only see half of it because the ground blocks the bottom half!"
  },
  {
    "id": "k-8",
    "gradeLevel": "kindergarten",
    "subject": "science",
    "subjectLabel": "Ice & Heat",
    "subjectIcon": "🧊",
    "question": "If you leave an ice cube sitting on the warm kitchen counter, what will happen to it?",
    "options": [
      "It will turn into a rock",
      "It will melt into water",
      "It will turn into a leaf",
      "It will grow bigger"
    ],
    "correctAnswerIndex": 1,
    "hint": "Warmth turns cold, solid ice into something liquid that you can drink.",
    "thinkingAngle": "States of Matter: Ice is solid water. When it gets warm, it turns into liquid water.",
    "funFactExplanation": "Right on! Ice melts into water when it gets warmer than 32 degrees Fahrenheit (0 degrees Celsius). Water can be a solid (ice), a liquid (water), or a gas (steam)!"
  },
  {
    "id": "k-9",
    "gradeLevel": "kindergarten",
    "subject": "riddle",
    "subjectLabel": "Tick-Tock Riddle",
    "subjectIcon": "⏰",
    "question": "I have two hands and a round face, but no eyes, nose, or mouth. I tell you when it is time for lunch. What am I?",
    "options": [
      "A Mirror",
      "A Plate",
      "A Clock",
      "A Teddy Bear"
    ],
    "correctAnswerIndex": 2,
    "hint": "Listen for its gentle \"tick-tock\" sound as its hands move in a circle.",
    "thinkingAngle": "Word Meanings: A clock has a \"face\" (the dial) and \"hands\" (the pointers), but they are not human hands!",
    "funFactExplanation": "Tick-tock, you got it! A clock uses its hands to show hours and minutes so we can keep track of time all day long."
  },
  {
    "id": "k-10",
    "gradeLevel": "kindergarten",
    "subject": "riddle",
    "subjectLabel": "Night Light Riddle",
    "subjectIcon": "🌙",
    "question": "I glow softly in the dark night sky. Sometimes I look like a giant round silver coin, and sometimes I look like a curved banana. What am I?",
    "options": [
      "A Flashlight",
      "The Moon",
      "A Firefly",
      "A Traffic Light"
    ],
    "correctAnswerIndex": 1,
    "hint": "Look up out of your window before bed to see me shining above the trees.",
    "thinkingAngle": "Shape Changes: The moon appears to change shape as it orbits around the Earth.",
    "funFactExplanation": "Spot on! The Moon reflects sunlight to illuminate our nighttime sky. Its changing shapes are called phases!"
  },
  {
    "id": "k-11",
    "gradeLevel": "kindergarten",
    "subject": "wordplay",
    "subjectLabel": "Rhyme Time",
    "subjectIcon": "🎩",
    "question": "Which word rhymes with \"HAT\" and names a small, furry pet that loves to say \"meow\"?",
    "options": [
      "Dog",
      "Cat",
      "Pig",
      "Duck"
    ],
    "correctAnswerIndex": 1,
    "hint": "Both words end with the exact same \"-at\" sound: H-at and C-...?",
    "thinkingAngle": "Rhyming Families: Words that rhyme have the same ending vowel and consonant sounds.",
    "funFactExplanation": "Awesome rhyming! Hat and Cat rhyme. Other words in this family include bat, mat, rat, and sat!"
  },
  {
    "id": "k-12",
    "gradeLevel": "kindergarten",
    "subject": "logic",
    "subjectLabel": "Day & Night Patterns",
    "subjectIcon": "☀️",
    "question": "When the sun rises in the morning, it is DAY. When the sun goes down at dusk, what comes next?",
    "options": [
      "Night",
      "Breakfast",
      "Afternoon",
      "Morning again immediately"
    ],
    "correctAnswerIndex": 0,
    "hint": "It is the dark time when the stars come out and we get into our cozy beds to sleep.",
    "thinkingAngle": "Sequencing: Time moves in cycles. Day is always followed by night, and night is followed by day.",
    "funFactExplanation": "Super smart! Night comes after day because our giant Earth spins around like a carousel once every 24 hours!"
  },
  {
    "id": "1st-1",
    "gradeLevel": "1st_grade",
    "subject": "math",
    "subjectLabel": "Addition & Ten-Frames",
    "subjectIcon": "🧩",
    "question": "Leo has 7 toy racing cars. His sister gives him 5 more racing cars for his birthday. How many cars does Leo have in total?",
    "options": [
      "11 cars",
      "12 cars",
      "13 cars",
      "10 cars"
    ],
    "correctAnswerIndex": 1,
    "hint": "Think of 7: add 3 to make a full 10, then add the remaining 2.",
    "thinkingAngle": "Make a 10 Strategy: 7 + 3 = 10, then 10 + 2 = 12. Breaking numbers into tens makes mental math much faster!",
    "funFactExplanation": "Speedy math! 7 + 5 = 12. A group of 12 items is often called a \"dozen\", like a dozen eggs or donuts!"
  },
  {
    "id": "1st-2",
    "gradeLevel": "1st_grade",
    "subject": "math",
    "subjectLabel": "Skip Counting by 5s",
    "subjectIcon": "🖐️",
    "question": "If you count the fingers on 3 hands by skip-counting: 5, 10, ... what number comes next?",
    "options": [
      "12",
      "15",
      "20",
      "13"
    ],
    "correctAnswerIndex": 1,
    "hint": "Add 5 more to 10: 10 + 5 = ?",
    "thinkingAngle": "Pattern Recognition: Skip counting by 5s always ends with a 5 or a 0 (5, 10, 15, 20, 25...).",
    "funFactExplanation": "Bingo! 5, 10, 15. Skip-counting by 5s is also how we read the minute hand on analog clocks!"
  },
  {
    "id": "1st-3",
    "gradeLevel": "1st_grade",
    "subject": "math",
    "subjectLabel": "Telling Time",
    "subjectIcon": "⏰",
    "question": "On an analog clock, the short hour hand is pointing straight at 8, and the long minute hand is pointing straight up at 12. What time is it?",
    "options": [
      "12:00",
      "8:00",
      "8:30",
      "12:08"
    ],
    "correctAnswerIndex": 1,
    "hint": "The short hand tells the hour, and when the long hand is on 12, it is the start of that exact hour (:00).",
    "thinkingAngle": "Clock Reading: Short hand = Hour, Long hand = Minute.",
    "funFactExplanation": "Right on schedule! It is 8:00. If the long minute hand moved halfway around to the 6, it would be 8:30!"
  },
  {
    "id": "1st-4",
    "gradeLevel": "1st_grade",
    "subject": "science",
    "subjectLabel": "Plant Superpowers",
    "subjectIcon": "🌱",
    "question": "Which part of a plant grows deep down into the soil to drink water and anchor the plant in place?",
    "options": [
      "The Flower petals",
      "The Roots",
      "The Leaves",
      "The Stem"
    ],
    "correctAnswerIndex": 1,
    "hint": "They spread out like tiny underground fingers drinking moisture from the dirt.",
    "thinkingAngle": "Plant Anatomy: Roots absorb water underground, stems carry it upward, and leaves capture sunlight.",
    "funFactExplanation": "Spot on! The roots drink water and minerals. Some roots, like carrots and radishes, are yummy vegetables that humans eat!"
  },
  {
    "id": "1st-5",
    "gradeLevel": "1st_grade",
    "subject": "science",
    "subjectLabel": "Four Seasons",
    "subjectIcon": "🍂",
    "question": "In which season do temperatures cool down, green leaves turn red and gold, and squirrels gather acorns for winter?",
    "options": [
      "Spring",
      "Summer",
      "Autumn (Fall)",
      "Winter"
    ],
    "correctAnswerIndex": 2,
    "hint": "It comes right after the hot summer and right before snowy winter.",
    "thinkingAngle": "Cyclical Seasons: Spring brings blossoms, Summer brings heat, Autumn cools down and drops leaves, and Winter brings frost.",
    "funFactExplanation": "Spectacular! Autumn (or Fall) is when deciduous trees shed their leaves to save water and energy during the chilly winter."
  },
  {
    "id": "1st-6",
    "gradeLevel": "1st_grade",
    "subject": "science",
    "subjectLabel": "Shadow Secrets",
    "subjectIcon": "👥",
    "question": "What do you need to create a dark shadow on the sunny sidewalk?",
    "options": [
      "A mirror and cold water",
      "A light source and an object that blocks the light",
      "Dark paint and a brush",
      "A cloudy night with no moon"
    ],
    "correctAnswerIndex": 1,
    "hint": "When your body stands in front of the sun or a flashlight, what does it block?",
    "thinkingAngle": "Light Travels in Straight Lines: When an object gets in the way of light rays, the dark area behind it is a shadow.",
    "funFactExplanation": "Genius! Shadows form when an opaque object blocks light. Your shadow is shortest at noon when the sun is directly overhead!"
  },
  {
    "id": "1st-7",
    "gradeLevel": "1st_grade",
    "subject": "nature",
    "subjectLabel": "Winter Sleepers",
    "subjectIcon": "🐻",
    "question": "What is the word for when animals like bears and groundhogs take a deep, long sleep all winter to save energy?",
    "options": [
      "Migration",
      "Hibernation",
      "Camouflage",
      "Evaporation"
    ],
    "correctAnswerIndex": 1,
    "hint": "It starts with the letter \"H\" and sounds like \"hibernate\".",
    "thinkingAngle": "Survival Adaptations: When food is scarce in freezing weather, animals slow their heart rate and sleep through the cold.",
    "funFactExplanation": "Spot on! It is called hibernation. During hibernation, a bear’s heart rate can drop from 50 beats per minute down to just 8 beats per minute!"
  },
  {
    "id": "1st-8",
    "gradeLevel": "1st_grade",
    "subject": "nature",
    "subjectLabel": "Caterpillar Magic",
    "subjectIcon": "🦋",
    "question": "A tiny caterpillar wraps itself inside a chrysalis and undergoes metamorphosis. What does it emerge as?",
    "options": [
      "A Dragonfly",
      "A Butterfly",
      "A Ladybug",
      "A Grasshopper"
    ],
    "correctAnswerIndex": 1,
    "hint": "It has two colorful wings with scales and flutters gently from flower to flower.",
    "thinkingAngle": "Life Cycles: Egg -> Caterpillar (larva) -> Chrysalis (pupa) -> Adult Butterfly.",
    "funFactExplanation": "Magical! A caterpillar transforms into a butterfly. Butterflies taste food using special sensors located on their feet!"
  },
  {
    "id": "1st-9",
    "gradeLevel": "1st_grade",
    "subject": "wordplay",
    "subjectLabel": "Compound Words",
    "subjectIcon": "🥞",
    "question": "When you combine the word \"PAN\" (a cooking tool) with \"CAKE\" (a sweet baked treat), what tasty breakfast food do you get?",
    "options": [
      "Cupcake",
      "Pancake",
      "Panbread",
      "Cakebox"
    ],
    "correctAnswerIndex": 1,
    "hint": "It is a flat, round breakfast cake poured onto a griddle and topped with maple syrup!",
    "thinkingAngle": "Compound Word Fusion: Two separate whole words can join together to make a brand-new single word with a new meaning.",
    "funFactExplanation": "Delicious! Pancake is a compound word. Other compound words include rainbow, starfish, backpack, and sunshine!"
  },
  {
    "id": "1st-10",
    "gradeLevel": "1st_grade",
    "subject": "wordplay",
    "subjectLabel": "Opposite Detective",
    "subjectIcon": "↔️",
    "question": "What is the opposite (antonym) of the word \"WHISPER\"?",
    "options": [
      "Mumble",
      "Shout",
      "Listen",
      "Read"
    ],
    "correctAnswerIndex": 1,
    "hint": "When you whisper, your voice is quiet and soft. What is using your loudest voice called?",
    "thinkingAngle": "Antonyms: Words that have contrasting, opposite meanings (hot/cold, tall/short, whisper/shout).",
    "funFactExplanation": "Great vocabulary! The opposite of whisper is shout (or yell). Knowing antonyms helps make creative writing much more exciting!"
  },
  {
    "id": "1st-11",
    "gradeLevel": "1st_grade",
    "subject": "logic",
    "subjectLabel": "Seesaw Balance",
    "subjectIcon": "⚖️",
    "question": "On a playground seesaw, Bunny sits on one side and Bear sits on the other. Bear drops all the way down to the ground. Who is heavier?",
    "options": [
      "Bunny is heavier",
      "Bear is heavier",
      "They weigh the exact same",
      "The seesaw is broken"
    ],
    "correctAnswerIndex": 1,
    "hint": "Gravity pulls down harder on objects with more weight (mass).",
    "thinkingAngle": "Physical Balance: On a balance scale or seesaw, the heavier side tilts downward while the lighter side lifts up.",
    "funFactExplanation": "Sharp logic! The heavier object pulls its side down to the ground. If two kids weigh the exact same, the seesaw balances flat in the middle!"
  },
  {
    "id": "1st-12",
    "gradeLevel": "1st_grade",
    "subject": "riddle",
    "subjectLabel": "Footwear Riddle",
    "subjectIcon": "👟",
    "question": "I have a tongue but cannot speak, and I have laces that you tie up tight so you can run outside. What am I?",
    "options": [
      "A Hat",
      "A Shoe (Sneaker)",
      "A Glove",
      "A Backpack"
    ],
    "correctAnswerIndex": 1,
    "hint": "You put your socked foot inside me every time you go out to play!",
    "thinkingAngle": "Multiple Meanings: The flap of leather or cloth under a shoe’s laces is playfully called its \"tongue\"!",
    "funFactExplanation": "Tie it up, you got it! A shoe has a tongue and laces. Sneakers got their name in the late 1800s because rubber soles made walking so quiet you could \"sneak\" around!"
  },
  {
    "id": "2nd-1",
    "gradeLevel": "2nd_grade",
    "subject": "math",
    "subjectLabel": "Pocket Change Math",
    "subjectIcon": "🪙",
    "question": "Maya has 2 quarters and 3 dimes in her coin purse. How much money does she have in total?",
    "options": [
      "65 cents",
      "75 cents",
      "80 cents",
      "90 cents"
    ],
    "correctAnswerIndex": 2,
    "hint": "One quarter is worth 25 cents (25 + 25 = 50 cents). A dime is worth 10 cents. Add 3 dimes (30 cents) to 50 cents.",
    "thinkingAngle": "Group Coin Counting: Calculate the total of larger coin values first, then add the smaller coins.",
    "funFactExplanation": "Cha-ching! 2 quarters (50¢) + 3 dimes (30¢) = 80 cents ($0.80). Quarters have 119 tiny ridges on their edge to prevent counterfeiting!"
  },
  {
    "id": "2nd-2",
    "gradeLevel": "2nd_grade",
    "subject": "math",
    "subjectLabel": "Double Digit Regrouping",
    "subjectIcon": "🧮",
    "question": "A fruit stand has 48 sweet oranges. A farmer brings a fresh crate with 27 more oranges. How many oranges are there now?",
    "options": [
      "65 oranges",
      "75 oranges",
      "71 oranges",
      "85 oranges"
    ],
    "correctAnswerIndex": 1,
    "hint": "Add the ones place first: 8 + 7 = 15 (5 ones and carry 1 ten). Then add the tens: 1 + 4 + 2 = 7 tens.",
    "thinkingAngle": "Place Value Addition: 48 + 27 = (40 + 20) + (8 + 7) = 60 + 15 = 75.",
    "funFactExplanation": "Super calculation! 48 + 27 = 75 oranges. Oranges are berries botanically, and they originated in Southeast Asia thousands of years ago!"
  },
  {
    "id": "2nd-3",
    "gradeLevel": "2nd_grade",
    "subject": "math",
    "subjectLabel": "Even & Odd Numbers",
    "subjectIcon": "🔢",
    "question": "Which of the following numbers can be divided evenly into two equal teams with no one left over?",
    "options": [
      "17",
      "21",
      "24",
      "33"
    ],
    "correctAnswerIndex": 2,
    "hint": "Even numbers always end with 0, 2, 4, 6, or 8 in the ones digit.",
    "thinkingAngle": "Even vs Odd: Look strictly at the last digit. 4 is even, so 24 can be split cleanly into 12 and 12.",
    "funFactExplanation": "Terrific! 24 is an even number (12 + 12 = 24). Odd numbers always have one remainder left over when grouped in pairs."
  },
  {
    "id": "2nd-4",
    "gradeLevel": "2nd_grade",
    "subject": "science",
    "subjectLabel": "States of Matter",
    "subjectIcon": "💨",
    "question": "When a pot of water on the stove boils and heats up, what invisible gas does it turn into as it rises into the air?",
    "options": [
      "Water Vapor (Steam)",
      "Ice Crystals",
      "Liquid Nitrogen",
      "Carbon Dust"
    ],
    "correctAnswerIndex": 0,
    "hint": "Think of the steamy cloud rising from hot soup or an iron.",
    "thinkingAngle": "Evaporation & Phase Change: Adding heat energy causes liquid water molecules to spread out and turn into a gas called vapor.",
    "funFactExplanation": "Spot on! Liquid water evaporates into water vapor gas at 212°F (100°C). Clouds in the sky are actually formed when rising water vapor cools down and condenses!"
  },
  {
    "id": "2nd-5",
    "gradeLevel": "2nd_grade",
    "subject": "science",
    "subjectLabel": "Magnetic Power",
    "subjectIcon": "🧲",
    "question": "What happens when you push the NORTH poles of two strong magnets directly against each other?",
    "options": [
      "They stick together tightly",
      "They push apart (repel)",
      "They create sparks of fire",
      "They turn into plastic"
    ],
    "correctAnswerIndex": 1,
    "hint": "Remember the magnetic rule: opposite poles attract, but matching poles...?",
    "thinkingAngle": "Magnetic Polarity: Like poles repel (North pushes North, South pushes South), while unlike poles attract (North snaps to South).",
    "funFactExplanation": "Magnetic genius! Like poles repel each other. High-speed Maglev trains in Japan and China use this exact magnetic repulsion to float above tracks with zero friction!"
  },
  {
    "id": "2nd-6",
    "gradeLevel": "2nd_grade",
    "subject": "science",
    "subjectLabel": "Dinosaur Clues",
    "subjectIcon": "🦕",
    "question": "What do scientists call the stone-preserved bones, footprints, and teeth left behind by creatures that lived millions of years ago?",
    "options": [
      "Minerals",
      "Fossils",
      "Gems",
      "Statues"
    ],
    "correctAnswerIndex": 1,
    "hint": "Paleontologists dig carefully into ancient rock layers to unearth these prehistoric remains.",
    "thinkingAngle": "Earth History: Over immense spans of time, minerals replace organic bones and turn them into rock fossils.",
    "funFactExplanation": "Roaring success! Fossils teach us about ancient life. Even dinosaur poop can turn into fossils—scientists call fossilized poop \"coprolites\"!"
  },
  {
    "id": "2nd-7",
    "gradeLevel": "2nd_grade",
    "subject": "nature",
    "subjectLabel": "Bird Feathers",
    "subjectIcon": "🦉",
    "question": "Owls have velvety, soft serrated feathers on the edges of their wings. How does this help them hunt at night?",
    "options": [
      "It makes them fly completely silently",
      "It makes them glow in the dark",
      "It keeps them from getting hot",
      "It makes their flight much louder"
    ],
    "correctAnswerIndex": 0,
    "hint": "If mice on the forest floor heard whooshing wings, they would run away and hide.",
    "thinkingAngle": "Evolutionary Adaptation: Stealth hunting requires muffling air turbulence to eliminate wing noise.",
    "funFactExplanation": "Silent as a shadow! The comb-like fringes on owl feathers break up sound waves, letting owls glide in total silence so prey never hears them coming."
  },
  {
    "id": "2nd-8",
    "gradeLevel": "2nd_grade",
    "subject": "wordplay",
    "subjectLabel": "Plural Rules",
    "subjectIcon": "🦷",
    "question": "You have one tooth. If you brush all the enamel in your mouth, what is the plural word for more than one tooth?",
    "options": [
      "Tooths",
      "Teeth",
      "Teethes",
      "Toothies"
    ],
    "correctAnswerIndex": 1,
    "hint": "It changes the double \"o\" inside the word to double \"e\", just like goose changes to geese!",
    "thinkingAngle": "Irregular Plurals: Not all plurals add an \"s\". Some change their middle vowels (foot -> feet, tooth -> teeth, mouse -> mice).",
    "funFactExplanation": "Clean and bright! Tooth changes to teeth. Humans grow two sets of teeth in their lifetime: 20 primary baby teeth and 32 permanent adult teeth."
  },
  {
    "id": "2nd-9",
    "gradeLevel": "2nd_grade",
    "subject": "logic",
    "subjectLabel": "Line of Friends",
    "subjectIcon": "🚶",
    "question": "Five students are standing in a straight line for recess. Lucas is 3rd from the front. What position is Lucas if you count from the back?",
    "options": [
      "2nd from back",
      "3rd from back",
      "4th from back",
      "1st from back"
    ],
    "correctAnswerIndex": 1,
    "hint": "Draw 5 dots: [1] [2] [3] [4] [5]. Lucas is at dot #3. Now count backwards from #5: 5 is 1st, 4 is 2nd, 3 is...?",
    "thinkingAngle": "Symmetry in Counting: In a line of 5, position 3 is the exact midpoint (two people in front, two people behind).",
    "funFactExplanation": "Sharp spatial thinking! Lucas is 3rd from both the front and the back because 3 is the exact center of 5!"
  },
  {
    "id": "2nd-10",
    "gradeLevel": "2nd_grade",
    "subject": "logic",
    "subjectLabel": "Pattern Logic",
    "subjectIcon": "🔷",
    "question": "Examine this shape and color pattern: Red Circle, Blue Square, Red Circle, Blue Square, Red Circle... What comes next?",
    "options": [
      "Red Square",
      "Blue Square",
      "Green Triangle",
      "Blue Circle"
    ],
    "correctAnswerIndex": 1,
    "hint": "Look at the repeating rhythm: A, B, A, B, A, ...?",
    "thinkingAngle": "Unit of Repeat: The repeating core is [Red Circle, Blue Square]. Following Red Circle, the pattern must return to Blue Square.",
    "funFactExplanation": "Pattern master! Recognizing recurring sequences helps computer programmers write loops and mathematicians spot complex equations."
  },
  {
    "id": "2nd-11",
    "gradeLevel": "2nd_grade",
    "subject": "riddle",
    "subjectLabel": "Hole Riddle",
    "subjectIcon": "🧀",
    "question": "What gets bigger and bigger the more you take away from it?",
    "options": [
      "A Pile of sand",
      "A Hole in the ground",
      "A Balloon",
      "A Cake"
    ],
    "correctAnswerIndex": 1,
    "hint": "Think about using a shovel at the beach to dig in the sand.",
    "thinkingAngle": "Lateral Thinking: Usually removing stuff makes an object smaller, but when digging, removing dirt increases the empty space!",
    "funFactExplanation": "Clever deduction! A hole expands as you dig away more dirt. Some burrowing animals, like prairie dogs, dig underground tunnels over 30 feet long!"
  },
  {
    "id": "2nd-12",
    "gradeLevel": "2nd_grade",
    "subject": "riddle",
    "subjectLabel": "Raincoat Riddle",
    "subjectIcon": "☔",
    "question": "I go up when the rain comes down, and I go down when the sun comes out. What am I?",
    "options": [
      "A Kite",
      "An Elevator",
      "An Umbrella",
      "A Rainbow"
    ],
    "correctAnswerIndex": 2,
    "hint": "You pop it open above your head to keep dry in a thunderstorm.",
    "thinkingAngle": "Contrasting Verbs: \"Up\" means open, \"down\" means folded closed.",
    "funFactExplanation": "Stay dry! An umbrella opens up against rain. The earliest umbrellas were invented over 4,000 years ago in ancient Egypt and China to shade people from the sun!"
  },
  {
    "id": "3rd-1",
    "gradeLevel": "3rd_grade",
    "subject": "math",
    "subjectLabel": "Multiplication Arrays",
    "subjectIcon": "🧁",
    "question": "A baker arranges fresh cupcakes in a tray with 6 rows. Each row holds exactly 8 cupcakes. How many cupcakes are on the tray?",
    "options": [
      "42 cupcakes",
      "46 cupcakes",
      "48 cupcakes",
      "54 cupcakes"
    ],
    "correctAnswerIndex": 2,
    "hint": "Multiply rows by columns: 6 × 8 = ? (Think: 6 × 7 = 42, add 6 more).",
    "thinkingAngle": "Array Model: Area of an array is rows multiplied by columns. 6 × 8 = 48.",
    "funFactExplanation": "Sweet math! 6 × 8 = 48 cupcakes. You can double-check with the commutative property: 8 × 6 also equals 48!"
  },
  {
    "id": "3rd-2",
    "gradeLevel": "3rd_grade",
    "subject": "math",
    "subjectLabel": "Pizza Fractions",
    "subjectIcon": "🍕",
    "question": "A large pizza is cut into 8 equal slices. Sofia eats 3 slices and Carlos eats 2 slices. What fraction of the pizza is left over?",
    "options": [
      "2/8",
      "3/8",
      "5/8",
      "1/8"
    ],
    "correctAnswerIndex": 1,
    "hint": "First find how many slices were eaten: 3 + 2 = 5 slices. Then subtract from the 8 total slices.",
    "thinkingAngle": "Fraction of a Whole: 8/8 - (3/8 + 2/8) = 8/8 - 5/8 = 3/8.",
    "funFactExplanation": "Spot on! 3/8 of the pizza remains. Fractions help us split food, share resources, and measure ingredients accurately."
  },
  {
    "id": "3rd-3",
    "gradeLevel": "3rd_grade",
    "subject": "math",
    "subjectLabel": "Perimeter Detective",
    "subjectIcon": "📏",
    "question": "A rectangular garden has a length of 7 feet and a width of 4 feet. What is the total perimeter (distance around the outside border)?",
    "options": [
      "11 feet",
      "22 feet",
      "28 feet",
      "32 feet"
    ],
    "correctAnswerIndex": 1,
    "hint": "Perimeter adds all 4 sides: Length + Width + Length + Width (7 + 4 + 7 + 4).",
    "thinkingAngle": "Perimeter vs Area: Area is 7 × 4 = 28 sq ft. Perimeter is the fence boundary: 2 × (7 + 4) = 22 ft.",
    "funFactExplanation": "Great boundary math! Perimeter is 22 feet. The word perimeter comes from the Greek \"peri\" (around) and \"metron\" (measure)!"
  },
  {
    "id": "3rd-4",
    "gradeLevel": "3rd_grade",
    "subject": "science",
    "subjectLabel": "Solar System Giants",
    "subjectIcon": "🪐",
    "question": "Which planet in our solar system is the largest, possessing a swirling giant red storm and more than 90 moons?",
    "options": [
      "Mars",
      "Saturn",
      "Jupiter",
      "Neptune"
    ],
    "correctAnswerIndex": 2,
    "hint": "It is the 5th planet from the Sun and is a massive gas giant.",
    "thinkingAngle": "Planetary Science: Jupiter is so colossal that all other seven planets could fit inside it combined.",
    "funFactExplanation": "Cosmic truth! Jupiter is the king of planets. Its Great Red Spot is a hurricane-like storm bigger than planet Earth that has raged for over 300 years!"
  },
  {
    "id": "3rd-5",
    "gradeLevel": "3rd_grade",
    "subject": "science",
    "subjectLabel": "Ecosystem Food Chains",
    "subjectIcon": "☀️",
    "question": "In any food chain, what are green plants called because they make their own food using sunlight?",
    "options": [
      "Decomposers",
      "Producers",
      "Consumers",
      "Carnivores"
    ],
    "correctAnswerIndex": 1,
    "hint": "They \"produce\" energy through photosynthesis rather than eating other organisms.",
    "thinkingAngle": "Trophic Levels: Producers (plants) make energy from light; primary consumers (herbivores) eat producers; secondary consumers eat herbivores.",
    "funFactExplanation": "Super science! Plants are producers. Using green chlorophyll, they absorb sunlight, water, and carbon dioxide to create glucose sugar and release fresh oxygen!"
  },
  {
    "id": "3rd-6",
    "gradeLevel": "3rd_grade",
    "subject": "science",
    "subjectLabel": "Gravity & Falling",
    "subjectIcon": "🍎",
    "question": "What invisible planetary force pulls objects, water, and the atmosphere downward toward the center of the Earth?",
    "options": [
      "Magnetism",
      "Gravity",
      "Electricity",
      "Friction"
    ],
    "correctAnswerIndex": 1,
    "hint": "Sir Isaac Newton famously observed an apple falling from a tree to understand this force.",
    "thinkingAngle": "Fundamental Forces: Gravity is an attractive force between all masses in the universe; Earth’s giant mass keeps us grounded.",
    "funFactExplanation": "Down to earth! Gravity keeps our feet on the ground and holds the oceans in place. On the Moon, gravity is only 1/6th as strong, so you could jump six times higher!"
  },
  {
    "id": "3rd-7",
    "gradeLevel": "3rd_grade",
    "subject": "nature",
    "subjectLabel": "Chameleon Camouflage",
    "subjectIcon": "🦎",
    "question": "Why do chameleons change the color of their skin?",
    "options": [
      "To match the sky when flying",
      "To communicate emotions, adjust to temperature, and blend into surroundings",
      "Because they run out of energy",
      "To scare birds with bright flashing lights"
    ],
    "correctAnswerIndex": 1,
    "hint": "Their color shifts when they are angry, cold, or hiding from predators on tree branches.",
    "thinkingAngle": "Multiple Functions of Adaptation: Color changing isn’t just for hiding; it’s also their social language and body thermometer.",
    "funFactExplanation": "Camouflage wizardry! Chameleons have specialized crystal cells called iridophores in their skin that rearrange to reflect different wavelengths of light!"
  },
  {
    "id": "3rd-8",
    "gradeLevel": "3rd_grade",
    "subject": "nature",
    "subjectLabel": "Forest Giants",
    "subjectIcon": "🌲",
    "question": "Coast Redwoods in California can live over 2,000 years and grow taller than the Statue of Liberty! How do their roots survive high winds?",
    "options": [
      "They have a single deep taproot down to Earth’s core",
      "Their roots interlock and weave together with neighboring redwood trees",
      "They tie themselves to rocks with vines",
      "They have roots that grow into the sky"
    ],
    "correctAnswerIndex": 1,
    "hint": "They stand strong together in groves by holding hands underground.",
    "thinkingAngle": "Symbiotic Ecology: Shallow, intertwined root networks distribute wind forces across the entire forest grove.",
    "funFactExplanation": "Teamwork in nature! Redwood roots are only 5 to 6 feet deep, but they spread out up to 100 feet and tangle tightly with neighbor roots so they never tip over!"
  },
  {
    "id": "3rd-9",
    "gradeLevel": "3rd_grade",
    "subject": "wordplay",
    "subjectLabel": "Homophone Clues",
    "subjectIcon": "Knight",
    "question": "Which pair of words sound exactly the same when spoken out loud, but have different spellings and completely different meanings?",
    "options": [
      "Night and Knight",
      "Play and Game",
      "Fast and Slow",
      "Bright and Shiny"
    ],
    "correctAnswerIndex": 0,
    "hint": "One is when the sun sets, and the other is a medieval warrior in shining armor.",
    "thinkingAngle": "Homophones: \"Homo\" means same, \"phone\" means sound. Same sound, different spelling/meaning.",
    "funFactExplanation": "Spot on! Night and Knight are homophones. Other famous homophones include pair/pear, sea/see, and flour/flower!"
  },
  {
    "id": "3rd-10",
    "gradeLevel": "3rd_grade",
    "subject": "wordplay",
    "subjectLabel": "Prefix Powers",
    "subjectIcon": "🔄",
    "question": "What does the prefix \"RE-\" mean when you add it to words like REWRITE, REPLAY, or REBUILD?",
    "options": [
      "Do it before",
      "Do it again",
      "Never do it",
      "Do it backwards"
    ],
    "correctAnswerIndex": 1,
    "hint": "When a teacher asks you to reread a story, what are you doing?",
    "thinkingAngle": "Morphology: Prefixes attach to base words to modify their meaning. Re- = again or back.",
    "funFactExplanation": "Prefix master! \"Re-\" means again. If you recycle, you cycle materials through another use again!"
  },
  {
    "id": "3rd-11",
    "gradeLevel": "3rd_grade",
    "subject": "logic",
    "subjectLabel": "Secret Number Clues",
    "subjectIcon": "🕵️",
    "question": "I am a mystery number between 20 and 30. I am an EVEN number, and the sum of my two digits is 8. What number am I?",
    "options": [
      "24",
      "26",
      "28",
      "22"
    ],
    "correctAnswerIndex": 1,
    "hint": "The first digit must be 2. If 2 + ? = 8, what must the second digit be? Is that number even?",
    "thinkingAngle": "Constraint Satisfaction: 1) Between 20-30 -> tens digit is 2. 2) Digits sum to 8 -> 2 + 6 = 8. 3) Even -> 26 ends in 6 (even).",
    "funFactExplanation": "Detective badge awarded! The number is 26 (2 + 6 = 8, and 26 is even). Eliminating options step-by-step is how data analysts solve problems."
  },
  {
    "id": "3rd-12",
    "gradeLevel": "3rd_grade",
    "subject": "riddle",
    "subjectLabel": "Map Mystery",
    "subjectIcon": "🗺️",
    "question": "I have cities, but no houses. I have mountains, but no trees. I have rivers and oceans, but not a single drop of water. What am I?",
    "options": [
      "A Dream",
      "A World Map",
      "A Desert",
      "A Painting in a museum"
    ],
    "correctAnswerIndex": 1,
    "hint": "Pirates use it to find buried treasure, and explorers use it to navigate.",
    "thinkingAngle": "Representational Symbols: A map represents geographical features using ink and paper without containing real physical matter.",
    "funFactExplanation": "Charted and conquered! A map represents geography. The oldest known maps were carved into clay tablets in Babylon over 2,600 years ago!"
  },
  {
    "id": "4th-1",
    "gradeLevel": "4th_grade",
    "subject": "math",
    "subjectLabel": "Multi-Digit Arithmetic",
    "subjectIcon": "🚀",
    "question": "A space probe travels 250 miles every hour. How many total miles will it travel during an 8-hour orbital mission?",
    "options": [
      "1,600 miles",
      "1,800 miles",
      "2,000 miles",
      "2,200 miles"
    ],
    "correctAnswerIndex": 2,
    "hint": "Multiply: 250 × 8. (Tip: 250 × 4 = 1,000. Now double that for 8 hours!).",
    "thinkingAngle": "Mental Math Factoring: 250 × 8 = 250 × (4 × 2) = 1,000 × 2 = 2,000.",
    "funFactExplanation": "Orbital velocity achieved! 250 × 8 = 2,000 miles. NASA’s real Voyager 1 spacecraft travels at roughly 38,000 miles per hour through interstellar space!"
  },
  {
    "id": "4th-2",
    "gradeLevel": "4th_grade",
    "subject": "math",
    "subjectLabel": "Angle Classifications",
    "subjectIcon": "📐",
    "question": "An angle measures exactly 115 degrees. How should this angle be classified?",
    "options": [
      "Acute angle",
      "Right angle",
      "Obtuse angle",
      "Straight angle"
    ],
    "correctAnswerIndex": 2,
    "hint": "Acute is < 90°, Right is exactly 90°, and Obtuse is between 90° and 180°.",
    "thinkingAngle": "Geometric Benchmarks: 90° is a square corner. Since 115° is wider than a square corner, it is obtuse.",
    "funFactExplanation": "Geometry pro! 115° is an obtuse angle. The word obtuse comes from the Latin \"obtusus\", meaning blunt or dull, because it’s wider than a sharp acute corner!"
  },
  {
    "id": "4th-3",
    "gradeLevel": "4th_grade",
    "subject": "math",
    "subjectLabel": "Division with Remainders",
    "subjectIcon": "🏕️",
    "question": "38 students are going camping. Each tent can hold at most 6 campers. What is the minimum number of tents needed so every student has a spot?",
    "options": [
      "6 tents",
      "7 tents",
      "8 tents",
      "5 tents"
    ],
    "correctAnswerIndex": 1,
    "hint": "38 ÷ 6 = 6 with a remainder of 2. Can you leave 2 campers outside in the rain?",
    "thinkingAngle": "Interpreting Remainders: Real-world problems often require rounding up to accommodate every individual (6 × 6 = 36 campers, so 1 more tent is required for the remaining 2).",
    "funFactExplanation": "Camp ready! 7 tents are required. In real life, math remainders must be interpreted practically—you cannot leave campers without a tent!"
  },
  {
    "id": "4th-4",
    "gradeLevel": "4th_grade",
    "subject": "science",
    "subjectLabel": "Rock Cycle Geology",
    "subjectIcon": "🌋",
    "question": "Which type of rock forms when red-hot molten lava cools and solidifies after an explosive volcanic eruption?",
    "options": [
      "Sedimentary rock",
      "Igneous rock",
      "Metamorphic rock",
      "Fossilized clay"
    ],
    "correctAnswerIndex": 1,
    "hint": "Its name comes from the Latin word for fire (\"ignis\"), like ignition.",
    "thinkingAngle": "The Rock Cycle: Igneous (from magma/lava), Sedimentary (compacted sand/sediment), Metamorphic (baked by deep underground heat & pressure).",
    "funFactExplanation": "Fiery geology! Igneous rocks include basalt, granite, and obsidian (black volcanic glass). Pumice is an igneous rock so filled with air bubbles that it actually floats on water!"
  },
  {
    "id": "4th-5",
    "gradeLevel": "4th_grade",
    "subject": "science",
    "subjectLabel": "Electric Circuits",
    "subjectIcon": "💡",
    "question": "In order for a battery to power a flashlight bulb, the wires and switch must form what kind of circuit?",
    "options": [
      "An Open circuit",
      "A Closed continuous loop",
      "A Disconnected circuit",
      "A Grounded break"
    ],
    "correctAnswerIndex": 1,
    "hint": "Electric current can only flow when there are no gaps in the loop from the battery to the bulb and back.",
    "thinkingAngle": "Current Flow: Electricity requires an unbroken, conductive closed loop. Turning off a light switch opens (breaks) the circuit.",
    "funFactExplanation": "Circuit closed! Electricity needs a complete closed loop to flow. Copper is used for wiring because its atoms have free electrons that drift easily."
  },
  {
    "id": "4th-6",
    "gradeLevel": "4th_grade",
    "subject": "science",
    "subjectLabel": "Light Bending (Refraction)",
    "subjectIcon": "🥤",
    "question": "When you place a straight pencil into a clear glass of water, why does the pencil appear bent or broken at the water line?",
    "options": [
      "The water dissolves the wood instantly",
      "Light waves slow down and bend as they enter water (refraction)",
      "The glass acts like a dark mirror",
      "Water gravity pushes the pencil"
    ],
    "correctAnswerIndex": 1,
    "hint": "Light travels faster through air than through dense liquid water.",
    "thinkingAngle": "Wave Optics: When light moves between mediums of different densities, it changes speed and bends, tricking our eyes.",
    "funFactExplanation": "Optical illusion mastered! Light travels at 186,000 miles per second in air, but slows down to 140,000 miles per second in water, bending light rays into an angle!"
  },
  {
    "id": "4th-7",
    "gradeLevel": "4th_grade",
    "subject": "nature",
    "subjectLabel": "Whale Communication",
    "subjectIcon": "🐋",
    "question": "Blue whales and humpback whales produce low-frequency songs that can travel for hundreds of miles. Why does sound travel so well through ocean water?",
    "options": [
      "Water molecules are packed much closer together than air molecules",
      "Whale songs use radio waves",
      "The ocean has no wind resistance",
      "Salt makes sound bouncy"
    ],
    "correctAnswerIndex": 0,
    "hint": "Sound is a mechanical vibration wave that travels faster through denser materials.",
    "thinkingAngle": "Acoustics: Sound travels about 4 times faster through water (approx. 1,500 m/s) than through air (approx. 343 m/s) because liquid particles collide quicker.",
    "funFactExplanation": "Deep sea acoustic genius! Whale songs can carry across entire ocean basins. A blue whale’s call is louder than a jet engine (188 decibels)!"
  },
  {
    "id": "4th-8",
    "gradeLevel": "4th_grade",
    "subject": "wordplay",
    "subjectLabel": "Idiom Detective",
    "subjectIcon": "🌧️",
    "question": "If someone tells you: \"Don’t worry about the rain, every dark cloud has a silver lining,\" what do they really mean?",
    "options": [
      "Clouds are filled with expensive precious metals",
      "Every difficult or bad situation has something hopeful or good in it",
      "Thunderstorms only happen in the daytime",
      "You should carry silver coins in the rain"
    ],
    "correctAnswerIndex": 1,
    "hint": "Think about figurative language versus literal meaning.",
    "thinkingAngle": "Idiomatic Metaphor: The sunlight shining behind a storm cloud creates a bright silver edge, symbolizing hope behind adversity.",
    "funFactExplanation": "Poetic wisdom! This proverb has been used in English literature since John Milton wrote it in 1634 to remind people to look for optimism during tough times."
  },
  {
    "id": "4th-9",
    "gradeLevel": "4th_grade",
    "subject": "logic",
    "subjectLabel": "Clock Hands Angle",
    "subjectIcon": "⌚",
    "question": "At exactly 3:00 on an analog clock, what is the angle formed between the hour hand and the minute hand?",
    "options": [
      "45 degrees",
      "60 degrees",
      "90 degrees (Right angle)",
      "180 degrees"
    ],
    "correctAnswerIndex": 2,
    "hint": "The minute hand is pointing straight up at 12 and the hour hand is pointing straight right at 3.",
    "thinkingAngle": "Circle Math: A clock is 360 degrees with 12 hour marks (360° ÷ 12 = 30° per hour). At 3:00, 3 hours × 30° = 90°.",
    "funFactExplanation": "Precision timing! The angle is a crisp 90° right angle. At 6:00, the hands form a straight 180° line, and at 12:00, the angle is 0°!"
  },
  {
    "id": "4th-10",
    "gradeLevel": "4th_grade",
    "subject": "logic",
    "subjectLabel": "Seating Deduction",
    "subjectIcon": "🪑",
    "question": "Four friends (Alex, Blake, Chloe, Dan) sit in a row of 4 chairs. Alex is not in an end chair. Chloe sits immediately to the right of Alex. Blake is in chair #1 on the far left. Who is in chair #4 on the far right?",
    "options": [
      "Alex",
      "Blake",
      "Chloe",
      "Dan"
    ],
    "correctAnswerIndex": 3,
    "hint": "Blake is in #1. Alex is in the middle (chair #2). Chloe is to his right (#3). Who is left for chair #4?",
    "thinkingAngle": "Constraint Deductive Logic: Chair 1 = Blake. Alex is not on the end, so Alex = 2. Chloe is right of Alex = 3. Remaining chair 4 = Dan.",
    "funFactExplanation": "Logical deduction unlocked! Dan must be in chair #4. Step-by-step logic grids are used in forensic science and law to reconstruct event timelines."
  },
  {
    "id": "4th-11",
    "gradeLevel": "4th_grade",
    "subject": "riddle",
    "subjectLabel": "Echo Riddle",
    "subjectIcon": "🗣️",
    "question": "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind and canyon walls. What am I?",
    "options": [
      "A Ghost",
      "An Echo",
      "A Radio",
      "A Cloud"
    ],
    "correctAnswerIndex": 1,
    "hint": "If you shout \"HELLO!\" into a deep rocky canyon, what answers back a second later?",
    "thinkingAngle": "Acoustic Reflection: Sound waves bounce off hard canyon rock surfaces and return to your ears as an echo.",
    "funFactExplanation": "Echo, echo, echo! Bats and dolphins use echoes (echolocation) to \"see\" in pitch-black darkness by measuring how long sound takes to bounce off obstacles!"
  },
  {
    "id": "4th-12",
    "gradeLevel": "4th_grade",
    "subject": "riddle",
    "subjectLabel": "Candle Riddle",
    "subjectIcon": "🕯️",
    "question": "I am tall when I am young, and I am short when I am old. I glow with warmth while I slowly disappear. What am I?",
    "options": [
      "A Tree",
      "A Candle",
      "A Pencil",
      "A Snowman"
    ],
    "correctAnswerIndex": 1,
    "hint": "Its wick burns wax for fuel, melting down lower and lower until it is gone.",
    "thinkingAngle": "Consumable Lifespan: As a candle burns its wax, its physical height steadily decreases.",
    "funFactExplanation": "Brilliant flame! A candle melts down as it burns. In ancient times before clocks, people made candles with marks on them to measure elapsed hours!"
  },
  {
    "id": "5th-1",
    "gradeLevel": "5th_grade",
    "subject": "math",
    "subjectLabel": "Decimal Place Value",
    "subjectIcon": "🏷️",
    "question": "At a grocery store, a block of cheddar cheese costs $4.85. You hand the cashier a $10.00 bill. How much exact change should you receive?",
    "options": [
      "5.15 dollars",
      "5.25 dollars",
      "5.85 dollars",
      "6.15 dollars"
    ],
    "correctAnswerIndex": 0,
    "hint": "Subtract: 10.00 - 4.85. Think: 4.85 + 0.15 = 5.00, then 5.00 + 5.00 = 10.00.",
    "thinkingAngle": "Counting Up for Change: $4.85 + $0.15 = $5.00; $5.00 + $5.00 = $10.00. Total change = $5.15.",
    "funFactExplanation": "Spot on! $10.00 - $4.85 = $5.15. Decimals are base-ten fractions: 15 cents represents 15/100ths of a dollar."
  },
  {
    "id": "5th-2",
    "gradeLevel": "5th_grade",
    "subject": "math",
    "subjectLabel": "Aquarium Volume",
    "subjectIcon": "🐠",
    "question": "A rectangular glass fish tank measures 10 inches long, 8 inches wide, and 12 inches high. What is its total volume in cubic inches?",
    "options": [
      "840 cubic inches",
      "960 cubic inches",
      "1,080 cubic inches",
      "1,200 cubic inches"
    ],
    "correctAnswerIndex": 1,
    "hint": "Volume of a rectangular prism = Length × Width × Height. Calculate (10 × 8) × 12.",
    "thinkingAngle": "3D Spatial Geometry: 10 × 8 = 80 sq inches of base area. 80 × 12 = 960 cubic inches.",
    "funFactExplanation": "Crystal clear volume! Volume = 960 cubic inches. One gallon of water is roughly 231 cubic inches, so this tank holds about 4.1 gallons of water!"
  },
  {
    "id": "5th-3",
    "gradeLevel": "5th_grade",
    "subject": "science",
    "subjectLabel": "Photosynthesis Chemistry",
    "subjectIcon": "🌿",
    "question": "During photosynthesis, green plant leaves absorb sunlight and carbon dioxide to make food. What vital gas do they release back into our atmosphere for animals to breathe?",
    "options": [
      "Nitrogen",
      "Oxygen",
      "Helium",
      "Hydrogen"
    ],
    "correctAnswerIndex": 1,
    "hint": "Every breath you inhale relies on this life-giving gas produced by trees and ocean algae.",
    "thinkingAngle": "Biochemical Cycle: 6CO2 + 6H2O + Light -> C6H12O6 (glucose) + 6O2 (oxygen).",
    "funFactExplanation": "Breathe easy! Plants produce oxygen. More than half of the oxygen in our entire atmosphere is produced not by land trees, but by microscopic ocean phytoplankton!"
  },
  {
    "id": "5th-4",
    "gradeLevel": "5th_grade",
    "subject": "science",
    "subjectLabel": "Human Circulatory System",
    "subjectIcon": "❤️",
    "question": "Which strong muscular pump in the human body beats about 100,000 times a day to circulate oxygen-rich blood through 60,000 miles of blood vessels?",
    "options": [
      "The Lungs",
      "The Brain",
      "The Heart",
      "The Liver"
    ],
    "correctAnswerIndex": 2,
    "hint": "Put your hand over the center-left of your chest to feel its rhythmic pulse.",
    "thinkingAngle": "Physiology & Anatomy: The heart has 4 chambers (atria and ventricles) that pump deoxygenated blood to the lungs and oxygenated blood to the body.",
    "funFactExplanation": "Heart of a champion! Your heart beats roughly 35 million times each year, pumping enough blood over an average lifetime to fill three Olympic swimming pools!"
  },
  {
    "id": "5th-5",
    "gradeLevel": "5th_grade",
    "subject": "science",
    "subjectLabel": "Atmospheric Layers",
    "subjectIcon": "🛰️",
    "question": "In which lowest layer of Earth’s atmosphere do we live, breathe, and experience almost all clouds, rain, snow, and daily weather?",
    "options": [
      "The Stratosphere",
      "The Troposphere",
      "The Mesosphere",
      "The Thermosphere"
    ],
    "correctAnswerIndex": 1,
    "hint": "It extends from sea level up to about 7 miles (11 km) high where commercial airplanes cruise near its top border.",
    "thinkingAngle": "Atmosphere Hierarchy: Troposphere (weather), Stratosphere (ozone layer), Mesosphere (meteors burn), Thermosphere (auroras & space station).",
    "funFactExplanation": "Atmospheric excellence! The troposphere contains 75% of all atmospheric air mass and almost all water vapor. As you climb higher in it, temperature drops rapidly!"
  },
  {
    "id": "5th-6",
    "gradeLevel": "5th_grade",
    "subject": "nature",
    "subjectLabel": "Octopus Intelligence",
    "subjectIcon": "🐙",
    "question": "An octopus has 3 hearts, blue copper-based blood, and no bones. Where are two-thirds of an octopus’s neurons (brain cells) located?",
    "options": [
      "In its beak",
      "Spread throughout its 8 flexible arms",
      "In its suction cups only",
      "In its camouflage skin"
    ],
    "correctAnswerIndex": 1,
    "hint": "Each arm can touch, taste, and make decisions independently from the central brain!",
    "thinkingAngle": "Distributed Nervous Systems: Instead of having all cognition locked inside a skull, octopuses have mini-brains distributed across each arm.",
    "funFactExplanation": "Mind-blowing biology! An octopus arm can explore a coral crevice and untie a knot on its own while the central brain is looking in another direction!"
  },
  {
    "id": "5th-7",
    "gradeLevel": "5th_grade",
    "subject": "wordplay",
    "subjectLabel": "Verbal Analogies",
    "subjectIcon": "🎯",
    "question": "Complete the relationship analogy: FEATHER is to BIRD as SCALE is to what?",
    "options": [
      "DOG",
      "FISH",
      "TREE",
      "HORSE"
    ],
    "correctAnswerIndex": 1,
    "hint": "Feathers are the specialized outer body covering of birds. What animal is covered in protective scales?",
    "thinkingAngle": "Relational Logic: [Outer covering] : [Class of animal]. Feather covers Bird -> Scale covers Fish (or Reptile).",
    "funFactExplanation": "Sharp analogy! Scales protect fish and reptiles just like feathers insulate birds and fur insulates mammals."
  },
  {
    "id": "5th-8",
    "gradeLevel": "5th_grade",
    "subject": "logic",
    "subjectLabel": "The Fox, Goose & Grain",
    "subjectIcon": "🛶",
    "question": "A farmer must row across a river with a fox, a goose, and a bag of grain. The small boat can only hold the farmer and ONE item at a time. If left alone together, the fox eats the goose, or the goose eats the grain. What must the farmer carry across on the FIRST trip?",
    "options": [
      "The Fox",
      "The Bag of grain",
      "The Goose",
      "Nothing, row alone"
    ],
    "correctAnswerIndex": 2,
    "hint": "If you take the fox first, what will the goose do to the grain? If you take the grain first, what will the fox do to the goose?",
    "thinkingAngle": "Constraint Satisfaction & State Trees: Only the goose is in danger from the fox AND dangerous to the grain. Leaving Fox + Grain together is completely safe!",
    "funFactExplanation": "Classic river riddle mastered! The farmer takes the goose across first because foxes do not eat grain. Then on return trips, the farmer skillfully swaps items to prevent any snacking!"
  },
  {
    "id": "5th-9",
    "gradeLevel": "5th_grade",
    "subject": "logic",
    "subjectLabel": "Speed & Distance Race",
    "subjectIcon": "🏎️",
    "question": "Car Alpha drives 60 miles per hour for 3 hours. Car Beta drives 50 miles per hour for 4 hours. Which car traveled farther, and by how much?",
    "options": [
      "Car Alpha by 10 miles",
      "Car Beta by 20 miles",
      "They both traveled the exact same distance (180 miles)",
      "Car Beta by 10 miles"
    ],
    "correctAnswerIndex": 1,
    "hint": "Distance = Speed × Time. Alpha: 60 × 3 = ? miles. Beta: 50 × 4 = ? miles. Compare the two totals.",
    "thinkingAngle": "Rate Problems: Distance = r × t. Alpha: 60 × 3 = 180 miles. Beta: 50 × 4 = 200 miles. Difference = 200 - 180 = 20 miles.",
    "funFactExplanation": "Formula champion! Car Beta traveled 200 miles, beating Car Alpha’s 180 miles by 20 miles. Higher speed doesn’t win if the other vehicle drives longer!"
  },
  {
    "id": "5th-10",
    "gradeLevel": "5th_grade",
    "subject": "logic",
    "subjectLabel": "Truth-Teller Puzzle",
    "subjectIcon": "🎭",
    "question": "You meet two twins at a castle gate. One twin ALWAYS tells the truth, and the other ALWAYS lies. Twin A says: \"Both of us are liars.\" What can you conclude about Twin A?",
    "options": [
      "Twin A is a truth-teller",
      "Twin A is a liar",
      "Both twins are truth-tellers",
      "It is impossible to tell"
    ],
    "correctAnswerIndex": 1,
    "hint": "Could a truth-teller ever say \"I am a liar\"? If that statement were true, the speaker would be a liar, which is a contradiction!",
    "thinkingAngle": "Self-Referential Paradox: If Twin A told the truth, the statement \"we are both liars\" would mean Twin A is a liar (contradiction). Therefore, the statement is false, and Twin A is a liar!",
    "funFactExplanation": "Philosophical logic triumph! Twin A is lying. This is a classic paradox studied in mathematical logic and computer science."
  },
  {
    "id": "5th-11",
    "gradeLevel": "5th_grade",
    "subject": "riddle",
    "subjectLabel": "Keyhole Mystery",
    "subjectIcon": "🗝️",
    "question": "I have keys, but no locks. I have space, but no room. You can enter, but you cannot go outside. What am I?",
    "options": [
      "A Piano",
      "A Computer Keyboard",
      "A Treasure Chest",
      "A Hotel Lobby"
    ],
    "correctAnswerIndex": 1,
    "hint": "You are using one right now with letters, an Enter key, and a Spacebar!",
    "thinkingAngle": "Polysemy (Multiple Meanings): \"Key\", \"Space\", and \"Enter\" have mechanical meaning on computer keyboards rather than physical architecture.",
    "funFactExplanation": "Typed to perfection! A computer keyboard has letter keys, a space bar, and an enter key. The QWERTY keyboard layout was designed in 1873 for mechanical typewriters!"
  },
  {
    "id": "5th-12",
    "gradeLevel": "5th_grade",
    "subject": "riddle",
    "subjectLabel": "Mirror Reflection",
    "subjectIcon": "🪞",
    "question": "What belongs entirely to you, but everyone else uses it far more often than you do?",
    "options": [
      "Your Bicycle",
      "Your Name",
      "Your Shoes",
      "Your Toothbrush"
    ],
    "correctAnswerIndex": 1,
    "hint": "When people want your attention or greet you in the hallway, what word do they say?",
    "thinkingAngle": "Perspective Inversion: While it is your personal identity property, other people speak it constantly to refer to you.",
    "funFactExplanation": "Name dropped! Your name belongs to you, but friends, teachers, and family say it all day long!"
  },
  {
    "id": "mid-1",
    "gradeLevel": "middle_school",
    "subject": "math",
    "subjectLabel": "Pre-Algebra Equations",
    "subjectIcon": "🔢",
    "question": "Solve for the unknown variable x in the equation: 4x - 7 = 25.",
    "options": [
      "x = 6",
      "x = 8",
      "x = 9",
      "x = 7"
    ],
    "correctAnswerIndex": 1,
    "hint": "First isolate the variable term by adding 7 to both sides: 4x = 32. Then divide both sides by 4.",
    "thinkingAngle": "Inverse Operations: Undo subtraction with addition (25 + 7 = 32), then undo multiplication with division (32 ÷ 4 = 8).",
    "funFactExplanation": "Algebra ace! 4(8) - 7 = 32 - 7 = 25. The word \"algebra\" comes from the 9th-century Arabic mathematician al-Khwarizmi’s book title \"al-Jabr\", meaning reunion of broken parts!"
  },
  {
    "id": "mid-2",
    "gradeLevel": "middle_school",
    "subject": "math",
    "subjectLabel": "Proportions & Scale",
    "subjectIcon": "🗺️",
    "question": "On an architectural blueprint, a scale of 0.5 inches represents 6 actual feet. How many actual feet does a wall measuring 3.5 inches on the blueprint represent?",
    "options": [
      "36 feet",
      "42 feet",
      "48 feet",
      "54 feet"
    ],
    "correctAnswerIndex": 1,
    "hint": "Find how many 0.5-inch units are in 3.5 inches: 3.5 ÷ 0.5 = 7 units. Each unit is 6 feet, so calculate 7 × 6.",
    "thinkingAngle": "Proportional Reasoning: 0.5 in / 6 ft = 3.5 in / x ft. Cross-multiplying gives 0.5x = 21, so x = 42.",
    "funFactExplanation": "Architectural scale master! 3.5 inches represents 42 feet. Architects and city planners rely on ratios to draft skyscrapers on paper before building."
  },
  {
    "id": "mid-3",
    "gradeLevel": "middle_school",
    "subject": "math",
    "subjectLabel": "Probability Dice",
    "subjectIcon": "🎲",
    "question": "You roll a standard, fair 6-sided die once. What is the theoretical probability of rolling a prime number (2, 3, or 5)?",
    "options": [
      "1/6",
      "1/3 (2/6)",
      "1/2 (3/6)",
      "2/3 (4/6)"
    ],
    "correctAnswerIndex": 2,
    "hint": "Count the successful outcomes: {2, 3, 5} is 3 numbers out of 6 possible sides on the die.",
    "thinkingAngle": "Classical Probability: P(Event) = (Number of favorable outcomes) / (Total possible outcomes) = 3/6 = 1/2 (50%). Note that 1 is not prime!",
    "funFactExplanation": "Rolling in luck! 3 out of 6 outcomes is 1/2 or 50%. A prime number has exactly two distinct factors: 1 and itself (which is why the number 1 is not classified as prime)!"
  },
  {
    "id": "mid-4",
    "gradeLevel": "middle_school",
    "subject": "science",
    "subjectLabel": "Periodic Table Elements",
    "subjectIcon": "🎈",
    "question": "Which element is atomic number 2 on the Periodic Table, lighter than air, completely non-flammable, and used to float party balloons and cool MRI machines?",
    "options": [
      "Hydrogen (H)",
      "Helium (He)",
      "Nitrogen (N)",
      "Oxygen (O)"
    ],
    "correctAnswerIndex": 1,
    "hint": "Hydrogen is atomic number 1, but it is highly flammable. This noble gas has symbol He.",
    "thinkingAngle": "Atomic Structure & Noble Gases: Helium has 2 protons and 2 electrons with a full valence shell, making it an inert (non-reactive) noble gas.",
    "funFactExplanation": "Noble science! Helium is the second most abundant element in the universe, formed inside stars through nuclear fusion. It was first discovered in sunlight before Earth!"
  },
  {
    "id": "mid-5",
    "gradeLevel": "middle_school",
    "subject": "science",
    "subjectLabel": "Newton’s Third Law",
    "subjectIcon": "🚀",
    "question": "Newton’s Third Law of Motion states that for every action, there is an equal and opposite reaction. How does this law explain how a rocket launches into space?",
    "options": [
      "The rocket pushes against the launchpad air",
      "Burning fuel pushes downward with immense force, so the rocket is propelled upward with equal force",
      "Solar wind pulls the rocket from above",
      "Earth’s gravity turns off when fuel burns"
    ],
    "correctAnswerIndex": 1,
    "hint": "Think about letting go of an untied blown-up balloon: air rushes backwards out the neck, propelling the balloon forward.",
    "thinkingAngle": "Action-Reaction Pairs: F_exhaust = -F_rocket. Mass times acceleration of expelled gas equals forward thrust, functioning even in the vacuum of space where there is no air to push against!",
    "funFactExplanation": "Liftoff confirmed! Rockets don’t push against the ground or air; they push against their own expelled exhaust mass! That is why rockets work perfectly in the vacuum of space."
  },
  {
    "id": "mid-6",
    "gradeLevel": "middle_school",
    "subject": "science",
    "subjectLabel": "Plate Tectonics",
    "subjectIcon": "🌋",
    "question": "The Pacific \"Ring of Fire\" accounts for 75% of Earth’s active volcanoes and 90% of earthquakes. What geological process causes this intense activity along tectonic plate boundaries?",
    "options": [
      "Earth’s magnetic field overheating",
      "Subduction and sliding collisions of tectonic plates",
      "Deep ocean whirlpools pulling rocks down",
      "Lunar tides pulling magma through cracks"
    ],
    "correctAnswerIndex": 1,
    "hint": "Dense oceanic plates slide under continental plates into the mantle, melting rock into magma.",
    "thinkingAngle": "Plate Tectonics: Convergent and transform plate boundaries produce friction, pressure accumulation, and subduction zones where crust melts into magma chambers.",
    "funFactExplanation": "Earth shaking! The Ring of Fire is a 25,000-mile horseshoe where tectonic plates are constantly colliding, subducting, and creating deep ocean trenches like the Mariana Trench."
  },
  {
    "id": "mid-7",
    "gradeLevel": "middle_school",
    "subject": "science",
    "subjectLabel": "Genetics & Punnett Squares",
    "subjectIcon": "🧬",
    "question": "In pea plants, tall stem (T) is dominant and short stem (t) is recessive. If two heterozygous plants (Tt × Tt) cross, what percentage of offspring will be tall?",
    "options": [
      "25%",
      "50%",
      "75%",
      "100%"
    ],
    "correctAnswerIndex": 2,
    "hint": "Draw a 2x2 Punnett square: TT, Tt, Tt, tt. Any plant with at least one dominant \"T\" will be tall.",
    "thinkingAngle": "Mendelian Genetics: TT (tall), Tt (tall), Tt (tall), tt (short). 3 out of 4 boxes contain the dominant allele T, yielding a 3:1 phenotypic ratio (75% tall, 25% short).",
    "funFactExplanation": "Genetics genius! 75% will be tall. Gregor Mendel discovered these laws of heredity in the 1860s by breeding over 28,000 pea plants in his monastery garden!"
  },
  {
    "id": "mid-8",
    "gradeLevel": "middle_school",
    "subject": "nature",
    "subjectLabel": "Coral Reef Symbiosis",
    "subjectIcon": "🪸",
    "question": "Coral reefs look like colorful rocks, but corals are actually colonial animals! What tiny microscopic organism lives inside coral tissues, providing food via photosynthesis?",
    "options": [
      "Zooxanthellae (algae)",
      "Small shrimp",
      "Sea urchin larvae",
      "Bacteria from sand"
    ],
    "correctAnswerIndex": 0,
    "hint": "When ocean waters get too warm, corals expel this photosynthetic algae in an event called \"coral bleaching\".",
    "thinkingAngle": "Mutualistic Symbiosis: The coral animal provides a protected home and carbon dioxide, while the algae provides glucose sugars and bright pigments.",
    "funFactExplanation": "Marine marvel! Coral polyps and zooxanthellae algae share a mutualistic symbiosis. Coral reefs cover less than 1% of the ocean floor but support over 25% of all marine life!"
  },
  {
    "id": "mid-9",
    "gradeLevel": "middle_school",
    "subject": "wordplay",
    "subjectLabel": "Greek & Latin Roots",
    "subjectIcon": "📖",
    "question": "The Greek root \"CHRONO\" means time (as in chronological). What does the word \"SYNCHRONIZE\" literally mean based on its roots?",
    "options": [
      "To waste time",
      "To make occur at the same time together (syn = together + chron = time)",
      "To travel into the future",
      "To measure ancient clocks"
    ],
    "correctAnswerIndex": 1,
    "hint": "Think of synchronized swimmers who move in unison together at the exact same moment.",
    "thinkingAngle": "Etymology: Prefix \"syn-\" (together/with) + root \"chron\" (time) + suffix \"-ize\" (to make or cause).",
    "funFactExplanation": "Linguistics master! Synchronize means to cause to occur at the same time. The same root appears in chronic, chronicle, and anachronism!"
  },
  {
    "id": "mid-10",
    "gradeLevel": "middle_school",
    "subject": "logic",
    "subjectLabel": "Caesar Cipher",
    "subjectIcon": "🔐",
    "question": "In a Caesar cipher with a shift of +3 (A -> D, B -> E, C -> F), what secret English word does the encoded ciphertext \"F D W\" decode to?",
    "options": [
      "D O G",
      "C A T",
      "B A T",
      "R U N"
    ],
    "correctAnswerIndex": 1,
    "hint": "Shift each letter backward by 3 steps in the alphabet: F - 3 = ?, D - 3 = ?, W - 3 = ?.",
    "thinkingAngle": "Cryptographic Decryption: F(6) - 3 = C(3). D(4) - 3 = A(1). W(23) - 3 = T(20). Ciphertext \"FDW\" decodes to \"CAT\".",
    "funFactExplanation": "Code cracked! Julius Caesar used this substitution cipher over 2,000 years ago to send private military dispatches to his generals on the Roman front lines!"
  },
  {
    "id": "mid-11",
    "gradeLevel": "middle_school",
    "subject": "logic",
    "subjectLabel": "Bridge Crossing in the Dark",
    "subjectIcon": "🌉",
    "question": "Four travelers must cross a rickety bridge at night with one torch. The bridge holds at most 2 people at a time. The travelers cross in 1, 2, 5, and 10 minutes (a pair walks at the slower person’s pace). What is the minimum time needed for all 4 to cross?",
    "options": [
      "19 minutes",
      "17 minutes",
      "21 minutes",
      "15 minutes"
    ],
    "correctAnswerIndex": 1,
    "hint": "Strategy: Send the two fastest (1 & 2) first -> 2 min. Send 1 back with the torch -> 1 min. Send the two slowest (5 & 10) together -> 10 min. Send 2 back -> 2 min. Send 1 & 2 together -> 2 min.",
    "thinkingAngle": "Optimization Logic: Bundling the two slowest people (5 and 10) together eliminates the need for 10 minutes to be counted twice! 2 + 1 + 10 + 2 + 2 = 17 minutes.",
    "funFactExplanation": "Master-level optimization! 17 minutes is the mathematical minimum. Computer routing algorithms use this graph-optimization logic to speed up internet packet delivery."
  },
  {
    "id": "mid-12",
    "gradeLevel": "middle_school",
    "subject": "logic",
    "subjectLabel": "Venn Diagram Deductions",
    "subjectIcon": "⭕",
    "question": "In a class of 30 students, 18 play soccer, 15 play basketball, and 7 play BOTH sports. How many students in the class play NEITHER soccer nor basketball?",
    "options": [
      "4 students",
      "6 students",
      "7 students",
      "2 students"
    ],
    "correctAnswerIndex": 0,
    "hint": "Use the Principle of Inclusion-Exclusion: Total playing at least one sport = Soccer + Basketball - Both (18 + 15 - 7). Then subtract from 30.",
    "thinkingAngle": "Set Theory: Total in sports = 18 + 15 - 7 = 26 students. Total neither = 30 - 26 = 4 students.",
    "funFactExplanation": "Set theory champion! 4 students play neither sport. Venn diagrams were invented by John Venn in 1880 to visually calculate overlapping probability sets."
  },
  {
    "id": "mid-13",
    "gradeLevel": "middle_school",
    "subject": "logic",
    "subjectLabel": "Counterfeit Coin Balance",
    "subjectIcon": "⚖️",
    "question": "You have 9 gold coins that look identical, but ONE is a lighter counterfeit. Using a balance scale with two pans, what is the MINIMUM number of weighings guaranteed to find the fake coin?",
    "options": [
      "1 weighing",
      "2 weighings",
      "3 weighings",
      "4 weighings"
    ],
    "correctAnswerIndex": 1,
    "hint": "Divide the 9 coins into three equal piles of 3. Weigh Pile A against Pile B. If they balance, the fake is in Pile C!",
    "thinkingAngle": "Ternary Search Algorithm: A balance scale has 3 outcomes (left tilt, right tilt, balanced). 3^2 = 9, so 2 weighings can identify the exact coin among 9.",
    "funFactExplanation": "Information theory triumph! Just 2 weighings are needed. Computer search trees use ternary and binary division to search billions of database records in milliseconds."
  },
  {
    "id": "mid-14",
    "gradeLevel": "middle_school",
    "subject": "riddle",
    "subjectLabel": "Ticking Without Toes",
    "subjectIcon": "⌛",
    "question": "I have no flesh, no feathers, no scales, and no bone. Yet I have four fingers and a thumb of my own. What am I?",
    "options": [
      "A Skeleton",
      "A Glove",
      "A Mannequin hand",
      "A Shadow"
    ],
    "correctAnswerIndex": 1,
    "hint": "You slip your hand inside me on a cold winter morning to keep your fingers warm.",
    "thinkingAngle": "Literal Shape vs Living Biology: A glove possesses fingers and a thumb structurally without being made of living tissue.",
    "funFactExplanation": "Fitting like a glove! Gloves date back thousands of years. King Tutankhamun’s tomb in Egypt contained over 27 pairs of finely woven linen gloves!"
  },
  {
    "id": "high-1",
    "gradeLevel": "high_school",
    "subject": "math",
    "subjectLabel": "System of Linear Equations",
    "subjectIcon": "📈",
    "question": "Solve the system of equations for (x, y):\n2x + y = 11\nx - y = 1\nWhat is the value of x?",
    "options": [
      "x = 3",
      "x = 4",
      "x = 5",
      "x = 6"
    ],
    "correctAnswerIndex": 1,
    "hint": "Add the two equations directly together to eliminate y: (2x + y) + (x - y) = 11 + 1 -> 3x = 12.",
    "thinkingAngle": "Elimination Method: Adding the equations eliminates the +y and -y terms, yielding 3x = 12, which implies x = 4. Substituting back gives y = 3.",
    "funFactExplanation": "System solved! x = 4 and y = 3. Systems of linear equations form the mathematical foundation for economic modeling, flight navigation, and 3D computer graphics engines."
  },
  {
    "id": "high-2",
    "gradeLevel": "high_school",
    "subject": "math",
    "subjectLabel": "Exponential Growth",
    "subjectIcon": "🦠",
    "question": "A bacterial culture doubles in population every 20 minutes. If the culture starts with 100 bacteria at 12:00 PM, how many bacteria will there be at 2:00 PM (after 2 hours)?",
    "options": [
      "1,600",
      "3,200",
      "6,400",
      "12,800"
    ],
    "correctAnswerIndex": 2,
    "hint": "2 hours = 120 minutes. Number of doubling periods = 120 ÷ 20 = 6 cycles. Calculate 100 × 2^6.",
    "thinkingAngle": "Exponential Function: N(t) = N0 × 2^(t/d). 2^6 = 64. 100 × 64 = 6,400 bacteria.",
    "funFactExplanation": "Exponential scaling unlocked! 100 × 2^6 = 6,400 bacteria. Exponential growth explains viral epidemics, nuclear chain reactions, and compound interest in retirement investments."
  },
  {
    "id": "high-3",
    "gradeLevel": "high_school",
    "subject": "math",
    "subjectLabel": "Pythagorean Triples",
    "subjectIcon": "📐",
    "question": "A ladder rests against a vertical brick wall. The base of the ladder is placed 5 feet away from the wall, and the top touches a window 12 feet above the ground. How long is the ladder?",
    "options": [
      "13 feet",
      "14 feet",
      "15 feet",
      "17 feet"
    ],
    "correctAnswerIndex": 0,
    "hint": "Use the Pythagorean theorem for right triangles: a^2 + b^2 = c^2. Calculate 5^2 + 12^2 = 25 + 144.",
    "thinkingAngle": "Pythagorean Theorem: c = sqrt(5^2 + 12^2) = sqrt(25 + 144) = sqrt(169) = 13. (5-12-13 is a primitive Pythagorean triple).",
    "funFactExplanation": "Geometry precision! The ladder is exactly 13 feet long. Ancient Egyptian builders used knotted ropes in ratios of 3-4-5 and 5-12-13 to ensure right-angled corners when building the pyramids."
  },
  {
    "id": "high-4",
    "gradeLevel": "high_school",
    "subject": "science",
    "subjectLabel": "Cellular Respiration & ATP",
    "subjectIcon": "⚡",
    "question": "Which organelle inside eukaryotic cells is known as the powerhouse of the cell because it generates most of the chemical energy currency (ATP) via the Krebs cycle and oxidative phosphorylation?",
    "options": [
      "The Endoplasmic Reticulum",
      "The Golgi Apparatus",
      "The Mitochondria",
      "The Lysosome"
    ],
    "correctAnswerIndex": 2,
    "hint": "It has its own circular DNA and folded inner membranes called cristae.",
    "thinkingAngle": "Endosymbiotic Theory: Mitochondria originated as engulfed aerobic bacteria billions of years ago and produce adenosine triphosphate (ATP) for cellular work.",
    "funFactExplanation": "Mighty mitochondria! Human cells have hundreds to thousands of mitochondria. Your mitochondrial DNA is inherited almost exclusively from your biological mother!"
  },
  {
    "id": "high-5",
    "gradeLevel": "high_school",
    "subject": "science",
    "subjectLabel": "Wave Physics (Doppler Effect)",
    "subjectIcon": "🚑",
    "question": "When an emergency siren speeds toward you, the siren sounds higher pitched. As it passes and speeds away, the pitch drops noticeably lower. What physical wave phenomenon causes this shift?",
    "options": [
      "Diffraction",
      "The Doppler Effect",
      "Quantum Tunneling",
      "Total Internal Reflection"
    ],
    "correctAnswerIndex": 1,
    "hint": "The motion of the source compresses sound waves ahead of it and stretches them out behind it.",
    "thinkingAngle": "Frequency Shift: Approaching source compresses wavelengths (higher perceived frequency f); receding source stretches wavelengths (lower f). In astronomy, this causes \"redshift\" indicating an expanding universe.",
    "funFactExplanation": "Acoustic & cosmic physics! Austrian physicist Christian Doppler discovered this in 1842. Astronomers use optical Doppler redshift to prove that distant galaxies are speeding away from us as space expands."
  },
  {
    "id": "high-6",
    "gradeLevel": "high_school",
    "subject": "science",
    "subjectLabel": "Special Relativity",
    "subjectIcon": "⏳",
    "question": "According to Albert Einstein’s Theory of Special Relativity, what happens to time for an astronaut traveling inside a spacecraft moving near the speed of light compared to an observer on Earth?",
    "options": [
      "Time moves backward for the astronaut",
      "Time passes more slowly for the moving astronaut (time dilation)",
      "Time passes faster for the moving astronaut",
      "Time is completely unaffected by velocity"
    ],
    "correctAnswerIndex": 1,
    "hint": "Moving clocks run slower: as velocity approaches the speed of light c, elapsed proper time stretches.",
    "thinkingAngle": "Lorentz Time Dilation: t = t0 / sqrt(1 - v^2/c^2). As v approaches c, delta-t dilates, meaning fewer seconds tick on the spacecraft’s onboard clock.",
    "funFactExplanation": "Relativistic spacetime verified! Moving clocks tick slower. GPS satellites orbit Earth so fast that their atomic clocks experience time dilation and must be adjusted daily by 38 microseconds to stay accurate!"
  },
  {
    "id": "high-7",
    "gradeLevel": "high_school",
    "subject": "nature",
    "subjectLabel": "Ecological Trophic Cascades",
    "subjectIcon": "🐺",
    "question": "When gray wolves were reintroduced to Yellowstone National Park in 1995, they preyed on overpopulated elk. Elk stopped overgrazing riverbanks, allowing willow trees to regrow, which brought back beavers whose dams created ponds for songbirds and otters. What is this ecological phenomenon called?",
    "options": [
      "A Trophic Cascade",
      "Biomagnification",
      "Allopatric Speciation",
      "Primary Succession"
    ],
    "correctAnswerIndex": 0,
    "hint": "It describes an ecological chain reaction triggered by a top apex predator that cascades all the way down to plant life and river topography.",
    "thinkingAngle": "Top-Down Ecosystem Regulation: Apex predators control herbivore behavior and density, preventing ecosystem degradation across lower trophic levels.",
    "funFactExplanation": "Trophic cascade in action! The wolves even changed the physical geography of Yellowstone’s rivers because stabilized soil and tree roots reduced riverbank erosion!"
  },
  {
    "id": "high-8",
    "gradeLevel": "high_school",
    "subject": "wordplay",
    "subjectLabel": "Rhetorical Devices",
    "subjectIcon": "⚡",
    "question": "Neil Armstrong’s famous words: \"That’s one small step for man, one giant leap for mankind\" place contrasting ideas side-by-side in parallel grammatical structures. What rhetorical device is this?",
    "options": [
      "Oxymoron",
      "Antithesis",
      "Hyperbole",
      "Alliteration"
    ],
    "correctAnswerIndex": 1,
    "hint": "Anti = against/contrast + thesis = proposition/idea.",
    "thinkingAngle": "Rhetorical Analysis: Antithesis pairs direct opposites (small step vs giant leap, single man vs entire mankind) with balanced syntax for memorable emphasis.",
    "funFactExplanation": "Masterful rhetoric! Antithesis has been used by history’s greatest orators, including Martin Luther King Jr. (\"judge by the content of their character, not the color of their skin\") and JFK."
  },
  {
    "id": "high-9",
    "gradeLevel": "high_school",
    "subject": "wordplay",
    "subjectLabel": "Literary Irony",
    "subjectIcon": "🎭",
    "question": "In Shakespeare’s \"Romeo and Juliet\", the audience knows that Juliet has only taken a sleeping potion and is not actually dead, but Romeo believes she has died. What type of irony is this?",
    "options": [
      "Verbal irony",
      "Situational irony",
      "Dramatic irony",
      "Cosmic irony"
    ],
    "correctAnswerIndex": 2,
    "hint": "It occurs when the audience or reader knows crucial information that a character in the story does not know.",
    "thinkingAngle": "Dramatic Theory: Dramatic irony creates tension and suspense because the audience watches a tragic misunderstanding unfold helplessly.",
    "funFactExplanation": "Tragic mastery! Dramatic irony keeps audiences on the edge of their seats in literature, theater, and modern cinema suspense thrillers like Alfred Hitchcock films."
  },
  {
    "id": "high-10",
    "gradeLevel": "high_school",
    "subject": "logic",
    "subjectLabel": "Cognitive Biases",
    "subjectIcon": "🧠",
    "question": "A student searches online to research a debate topic, but only clicks on articles that confirm what they already believe while ignoring well-sourced scientific studies that disagree. What cognitive bias is this?",
    "options": [
      "Anchoring bias",
      "Confirmation bias",
      "The Dunning-Kruger effect",
      "The Framing effect"
    ],
    "correctAnswerIndex": 1,
    "hint": "The person actively seeks to \"confirm\" their pre-existing belief rather than seek objective truth.",
    "thinkingAngle": "Psychological Analysis: Confirmation bias causes individuals to seek, interpret, and remember information in a way that validates prior hypotheses, a major obstacle in scientific inquiry.",
    "funFactExplanation": "Critical thinking unlocked! The scientific method was explicitly designed to counter confirmation bias through double-blind peer review and falsifiability testing."
  },
  {
    "id": "high-11",
    "gradeLevel": "high_school",
    "subject": "logic",
    "subjectLabel": "Formal Syllogisms",
    "subjectIcon": "🏛️",
    "question": "Consider the premises:\n1. All humans are mortal.\n2. Socrates is a human.\nWhat is the logically valid deductive conclusion?",
    "options": [
      "Socrates is immortal",
      "Socrates is mortal",
      "All mortals are Socrates",
      "Socrates is a philosopher"
    ],
    "correctAnswerIndex": 1,
    "hint": "If set A (humans) is completely inside set B (mortals), and x (Socrates) is inside set A, then x must also be inside...?",
    "thinkingAngle": "Categorical Deductive Logic (Modus Ponens): If All H are M, and S is H, then S must necessarily be M. Deductive validity guarantees truth if premises are true.",
    "funFactExplanation": "Aristotelian logic mastered! Formulated over 2,300 years ago by Aristotle, formal syllogisms provided the foundation for Western philosophy, legal systems, and Boolean logic in computer microprocessors."
  },
  {
    "id": "high-12",
    "gradeLevel": "high_school",
    "subject": "logic",
    "subjectLabel": "Monty Hall Problem",
    "subjectIcon": "🚪",
    "question": "On a game show, there are 3 closed doors. Behind one door is a sports car; behind the other two are goats. You pick Door 1. The host, who knows what is behind every door, opens Door 3 to reveal a goat. He then offers you the choice: \"Do you want to switch to Door 2?\" To maximize your probability of winning the car, what should you do?",
    "options": [
      "Stay with Door 1 (it’s a 50/50 chance either way)",
      "Switch to Door 2 (switching doubles your chance to 2/3)",
      "Flip a coin because the odds do not change",
      "Pick Door 3"
    ],
    "correctAnswerIndex": 1,
    "hint": "When you initially chose Door 1, you had a 1/3 chance of being right and a 2/3 chance of being wrong. The host’s action concentrates that entire 2/3 probability into the remaining unopened door!",
    "thinkingAngle": "Conditional Probability (Bayesian Updating): P(Car behind Door 1) = 1/3. P(Car behind Door 2 or 3) = 2/3. Since the host eliminates Door 3 with certainty, all 2/3 probability transfers to Door 2. Switching wins 2/3 of the time!",
    "funFactExplanation": "Counterintuitive mathematical brilliance! Even PhD mathematicians argued with Marilyn vos Savant when she first published this answer in 1990 until computer simulations proved that switching wins 66.7% (2/3) of the time!"
  },
  {
    "id": "high-13",
    "gradeLevel": "high_school",
    "subject": "logic",
    "subjectLabel": "Prisoner’s Dilemma",
    "subjectIcon": "🤝",
    "question": "In game theory, the Prisoner’s Dilemma shows two suspects arrested for a crime. If both cooperate and stay silent, they both get 1 year in jail. If both defect and confess, they both get 5 years. But if one confesses while the other stays silent, the confessor goes free (0 years) while the silent one gets 10 years. Why do rational self-interested players usually both defect and end up with worse sentences?",
    "options": [
      "Because defecting is the dominant strategy regardless of what the other player chooses (Nash Equilibrium)",
      "Because staying silent is illegal in court",
      "Because they want to spend 5 years together",
      "Because game theory only applies to coin tosses"
    ],
    "correctAnswerIndex": 0,
    "hint": "Analyze each scenario: If the other suspect confesses, confessing gives 5 years instead of 10. If the other stays silent, confessing gives 0 years instead of 1. Confessing always gives an individual better outcome.",
    "thinkingAngle": "Game Theory & Nash Equilibrium: Individual rationality leads to a sub-optimal collective outcome (Pareto-inefficient). Both confessing is the stable Nash equilibrium even though mutual cooperation would be better.",
    "funFactExplanation": "Game theory decoded! The Prisoner’s Dilemma explains nuclear arms races, price wars between companies, and environmental agreements. John Nash won the Nobel Prize in Economics for analyzing these equilibria."
  },
  {
    "id": "high-14",
    "gradeLevel": "high_school",
    "subject": "riddle",
    "subjectLabel": "Lateral Thinking Paradox",
    "subjectIcon": "⚖️",
    "question": "A father and son are in a serious car accident. The father dies at the scene, and the injured son is rushed to the hospital for emergency surgery. In the operating room, the surgeon looks at the boy on the table, turns pale, and says: \"I cannot operate on this boy, he is my son!\" How is this possible?",
    "options": [
      "The surgeon is the boy’s mother",
      "The boy has two fathers",
      "The surgeon is a ghost",
      "Either A or B are completely valid explanations"
    ],
    "correctAnswerIndex": 3,
    "hint": "Do not make automatic assumptions about the gender or family structure of surgeons!",
    "thinkingAngle": "Challenging Unconscious Heuristics: Historically people assumed surgeons were male, overlooking that the surgeon could be his mother (or his other father in a two-dad family).",
    "funFactExplanation": "Cognitive trap avoided! Either the surgeon is his mother or his other father. Psychological studies use this famous lateral riddle to demonstrate how unconscious linguistic heuristics can trap human thinking."
  },
  {
    "id": "high-15",
    "gradeLevel": "high_school",
    "subject": "riddle",
    "subjectLabel": "Ship of Theseus Paradox",
    "subjectIcon": "⛵",
    "question": "A historic wooden ship has its decayed planks replaced one-by-one over centuries until not a single piece of original timber remains. If someone collects all the discarded original planks and builds a duplicate ship, which one is the \"true\" original Ship of Theseus?",
    "options": [
      "The continuously maintained ship",
      "The ship rebuilt from the discarded original planks",
      "Both have valid claims depending on whether identity is based on spatiotemporal continuity or original matter",
      "Neither can be considered a ship anymore"
    ],
    "correctAnswerIndex": 2,
    "hint": "Consider whether your own identity changes even though nearly all your body cells are replaced every decade.",
    "thinkingAngle": "Metaphysical Identity: Explores whether identity is defined by continuous functional structure over time or by physical constituent material.",
    "funFactExplanation": "Philosophical classic! First described by Greek historian Plutarch, this famous paradox is actively studied today in computer science regarding software updates, digital twins, and AI neural network upgrades!"
  }
];
