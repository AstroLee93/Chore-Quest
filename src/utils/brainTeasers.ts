import { GradeLevel, KidProfile } from '../types';

export interface GradeLevelInfo {
  id: GradeLevel;
  label: string;
  shortLabel: string;
  ages: string;
  icon: string;
  color: string;
  description: string;
}

export const GRADE_LEVELS: Record<GradeLevel, GradeLevelInfo> = {
  kindergarten: {
    id: 'kindergarten',
    label: 'Kindergarten & Pre-K',
    shortLabel: 'Kindergarten',
    ages: 'Ages 4–6',
    icon: '🌱',
    color: 'from-emerald-400 to-teal-500',
    description: 'Shapes, colors, counting, baby animal names, rhyming words & simple riddles.',
  },
  '1st_grade': {
    id: '1st_grade',
    label: '1st Grade',
    shortLabel: '1st Grade',
    ages: 'Ages 6–7',
    icon: '✏️',
    color: 'from-sky-400 to-blue-500',
    description: 'Addition & subtraction to 20, telling time, basic phonics, patterns & nature facts.',
  },
  '2nd_grade': {
    id: '2nd_grade',
    label: '2nd Grade',
    shortLabel: '2nd Grade',
    ages: 'Ages 7–8',
    icon: '📚',
    color: 'from-indigo-400 to-violet-500',
    description: 'Two-digit math, coin counting, animal habitats, spelling patterns & fun logic.',
  },
  '3rd_grade': {
    id: '3rd_grade',
    label: '3rd Grade',
    shortLabel: '3rd Grade',
    ages: 'Ages 8–9',
    icon: '🔬',
    color: 'from-purple-400 to-pink-500',
    description: 'Intro to multiplication, basic fractions, solar system, mystery words & word puzzles.',
  },
  '4th_grade': {
    id: '4th_grade',
    label: '4th Grade',
    shortLabel: '4th Grade',
    ages: 'Ages 9–10',
    icon: '🧭',
    color: 'from-amber-400 to-orange-500',
    description: 'Multi-digit arithmetic, US geography, ecosystems, lateral thinking & idioms.',
  },
  '5th_grade': {
    id: '5th_grade',
    label: '5th Grade',
    shortLabel: '5th Grade',
    ages: 'Ages 10–11',
    icon: '🚀',
    color: 'from-rose-400 to-red-500',
    description: 'Decimals, volume & area, planetary science, vocabulary analogies & tricky riddles.',
  },
  middle_school: {
    id: 'middle_school',
    label: 'Middle School (6th–8th)',
    shortLabel: 'Middle School',
    ages: 'Ages 11–14',
    icon: '⚡',
    color: 'from-cyan-500 to-blue-600',
    description: 'Pre-algebra, physical sciences, world history, deduction, logic & cipher codes.',
  },
  high_school: {
    id: 'high_school',
    label: 'High School (9th–12th)',
    shortLabel: 'High School',
    ages: 'Ages 14–18',
    icon: '🎓',
    color: 'from-fuchsia-500 to-purple-700',
    description: 'Algebra & geometry, advanced sciences, literature trivia, logic fallacies & brain teasers.',
  },
};

export const GRADE_LEVEL_LIST: GradeLevelInfo[] = [
  GRADE_LEVELS.kindergarten,
  GRADE_LEVELS['1st_grade'],
  GRADE_LEVELS['2nd_grade'],
  GRADE_LEVELS['3rd_grade'],
  GRADE_LEVELS['4th_grade'],
  GRADE_LEVELS['5th_grade'],
  GRADE_LEVELS.middle_school,
  GRADE_LEVELS.high_school,
];

export const DEFAULT_BRAIN_TEASER_REWARD_STARS = 5;

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
  funFactExplanation: string;
}

export const BRAIN_TEASERS_CATALOG: BrainTeaser[] = [
  // ==========================================
  // KINDERGARTEN & PRE-K (Ages 4-6)
  // ==========================================
  {
    id: 'k-1',
    gradeLevel: 'kindergarten',
    subject: 'math',
    subjectLabel: 'Counting Fun',
    subjectIcon: '🔢',
    question: 'If you have 3 juicy red apples 🍎 and Mom gives you 2 more apples 🍎, how many apples do you have altogether?',
    options: ['4 apples', '5 apples', '6 apples', '3 apples'],
    correctAnswerIndex: 1,
    hint: 'Count on your fingers: 1, 2, 3... plus 4, 5!',
    funFactExplanation: 'Awesome math! 3 + 2 = 5. Did you know apples float in water because 25% of their volume is actually air?',
  },
  {
    id: 'k-2',
    gradeLevel: 'kindergarten',
    subject: 'nature',
    subjectLabel: 'Animal Kingdom',
    subjectIcon: '🐾',
    question: 'What do we call a baby dog?',
    options: ['A Kitten', 'A Calf', 'A Puppy', 'A Chick'],
    correctAnswerIndex: 2,
    hint: 'This furry little baby loves to bark and wag its tail!',
    funFactExplanation: 'Spot on! A baby dog is called a puppy. Puppies are born with their eyes closed and open them after about 2 weeks!',
  },
  {
    id: 'k-3',
    gradeLevel: 'kindergarten',
    subject: 'riddle',
    subjectLabel: 'Silly Riddle',
    subjectIcon: '🧩',
    question: 'I am yellow, monkeys love to peel me, and I grow on tall plants. What fruit am I?',
    options: ['A Banana', 'An Orange', 'A Lemon', 'A Watermelon'],
    correctAnswerIndex: 0,
    hint: 'You peel off my yellow jacket to eat my sweet fruit!',
    funFactExplanation: 'You got it! It’s a banana 🍌! Bananas grow pointing upwards toward the sun, which is why they have their famous curve.',
  },
  {
    id: 'k-4',
    gradeLevel: 'kindergarten',
    subject: 'science',
    subjectLabel: 'Color Magic',
    subjectIcon: '🎨',
    question: 'What color do you get when you mix sunny Yellow and bright Blue paint together?',
    options: ['Purple', 'Green', 'Orange', 'Pink'],
    correctAnswerIndex: 1,
    hint: 'Think of the color of freshly mowed grass or leaves on trees!',
    funFactExplanation: 'Brilliant! Yellow and Blue make Green 💚. Yellow, Blue, and Red are called "Primary Colors" because you can mix them to make almost all other colors.',
  },
  {
    id: 'k-5',
    gradeLevel: 'kindergarten',
    subject: 'wordplay',
    subjectLabel: 'Rhyme Time',
    subjectIcon: '🎵',
    question: 'Which word rhymes with the word "CAT"?',
    options: ['DOG', 'HAT', 'FISH', 'BIRD'],
    correctAnswerIndex: 1,
    hint: 'You wear this on your head when you go outside on a sunny day!',
    funFactExplanation: 'Great ear! Cat and Hat both end with the "-at" sound! Rhyming helps your brain learn how to read words quickly.',
  },
  {
    id: 'k-6',
    gradeLevel: 'kindergarten',
    subject: 'logic',
    subjectLabel: 'Shape Detective',
    subjectIcon: '🔺',
    question: 'How many straight sides does a triangle have?',
    options: ['2 sides', '3 sides', '4 sides', '5 sides'],
    correctAnswerIndex: 1,
    hint: 'Tri- means three, like a tricycle with three wheels!',
    funFactExplanation: 'Super job! A triangle always has 3 sides and 3 corners. Triangles are the strongest shape in building bridges!',
  },

  // ==========================================
  // 1ST GRADE (Ages 6-7)
  // ==========================================
  {
    id: 'g1-1',
    gradeLevel: '1st_grade',
    subject: 'math',
    subjectLabel: 'Ten-Frame Math',
    subjectIcon: '🧮',
    question: 'You have 7 shiny gold stars ⭐. How many more stars do you need to reach a full set of 10 stars?',
    options: ['2 stars', '3 stars', '4 stars', '5 stars'],
    correctAnswerIndex: 1,
    hint: 'What number plus 7 equals 10? 7 + ? = 10',
    funFactExplanation: 'Bingo! 7 + 3 = 10. Making groups of 10 is one of the most powerful tricks in mental math!',
  },
  {
    id: 'g1-2',
    gradeLevel: '1st_grade',
    subject: 'science',
    subjectLabel: 'Sky & Weather',
    subjectIcon: '🌈',
    question: 'What two things must happen in the sky at the same time to see a beautiful rainbow?',
    options: ['Snow and Wind', 'Sunlight and Rain drops', 'Thunder and Lightning', 'Dark clouds and Stars'],
    correctAnswerIndex: 1,
    hint: 'You need light from the sky shining through droplets of water!',
    funFactExplanation: 'Spectacular! When sunlight passes through raindrops, they act like tiny prisms that bend and split light into 7 vibrant colors!',
  },
  {
    id: 'g1-3',
    gradeLevel: '1st_grade',
    subject: 'riddle',
    subjectLabel: 'Brain Riddle',
    subjectIcon: '💡',
    question: 'What has a face and two hands, but has no arms or legs?',
    options: ['A Clock', 'A Teddy Bear', 'A Mirror', 'A Robot'],
    correctAnswerIndex: 0,
    hint: 'Tick-tock, tick-tock! It hangs on the wall and tells you what time it is.',
    funFactExplanation: 'Clever thinking! A clock has an hour hand and a minute hand, and its front surface is called its face ⏰!',
  },
  {
    id: 'g1-4',
    gradeLevel: '1st_grade',
    subject: 'nature',
    subjectLabel: 'Insect Wonders',
    subjectIcon: '🐝',
    question: 'How many legs does an insect like an ant or a honeybee have?',
    options: ['4 legs', '6 legs', '8 legs', '10 legs'],
    correctAnswerIndex: 1,
    hint: 'Spiders have 8 legs, but true insects always have two less!',
    funFactExplanation: 'Spot on! All insects have exactly 6 legs (3 pairs) and 3 body sections: head, thorax, and abdomen.',
  },
  {
    id: 'g1-5',
    gradeLevel: '1st_grade',
    subject: 'math',
    subjectLabel: 'Time Detective',
    subjectIcon: '⏱️',
    question: 'If the short hand of an analog clock points right at 4, and the long hand points straight up at 12, what time is it?',
    options: ['12:00', '4:00', '4:30', '1:00'],
    correctAnswerIndex: 1,
    hint: 'The short hand tells the hour, and pointing at 12 means zero minutes past!',
    funFactExplanation: 'Spot on! That is 4:00 (four o’clock). The short hand is the hour hand, and the long hand is the minute hand.',
  },
  {
    id: 'g1-6',
    gradeLevel: '1st_grade',
    subject: 'wordplay',
    subjectLabel: 'Word Power',
    subjectIcon: '📖',
    question: 'Which of these words is an OPPOSITE (antonym) of the word "HOT"?',
    options: ['Warm', 'Sunny', 'Cold', 'Bright'],
    correctAnswerIndex: 2,
    hint: 'Think of how ice cubes or snow feel when you touch them!',
    funFactExplanation: 'Correct! "Cold" is the direct opposite of "Hot". Opposites in language are called antonyms.',
  },

  // ==========================================
  // 2ND GRADE (Ages 7-8)
  // ==========================================
  {
    id: 'g2-1',
    gradeLevel: '2nd_grade',
    subject: 'math',
    subjectLabel: 'Money Math',
    subjectIcon: '🪙',
    question: 'If you have 2 quarters, 1 dime, and 1 nickel, how much money do you have in total?',
    options: ['50 cents', '60 cents', '65 cents', '75 cents'],
    correctAnswerIndex: 2,
    hint: 'Each quarter = 25¢ (25 + 25 = 50¢), dime = 10¢, nickel = 5¢. Add them up!',
    funFactExplanation: 'Terrific! 25¢ + 25¢ + 10¢ + 5¢ = 65¢. Quarters have ridges along their edges to prevent counterfeiting centuries ago!',
  },
  {
    id: 'g2-2',
    gradeLevel: '2nd_grade',
    subject: 'science',
    subjectLabel: 'Animal Adaptations',
    subjectIcon: '❄️',
    question: 'Why do polar bears have thick layers of blubber fat and water-repellent white fur?',
    options: ['To help them fly', 'To stay warm and camouflage in the Arctic snow', 'To see underwater in the dark', 'To run faster on roads'],
    correctAnswerIndex: 1,
    hint: 'Think about where polar bears live—surrounded by freezing ice and snow!',
    funFactExplanation: 'Great observation! Under their white fur, polar bear skin is actually pitch black! It absorbs sunlight to keep them toasty warm in sub-zero temperatures.',
  },
  {
    id: 'g2-3',
    gradeLevel: '2nd_grade',
    subject: 'logic',
    subjectLabel: 'Number Pattern',
    subjectIcon: '🔢',
    question: 'Look closely at the pattern: 5, 10, 15, 20, 25, __? What number comes next?',
    options: ['26', '30', '35', '50'],
    correctAnswerIndex: 1,
    hint: 'Each step jumps forward by adding 5 every time!',
    funFactExplanation: 'You nailed it! 25 + 5 = 30. Counting by 5s is also how we read the minute hand on clocks!',
  },
  {
    id: 'g2-4',
    gradeLevel: '2nd_grade',
    subject: 'riddle',
    subjectLabel: 'Lateral Riddle',
    subjectIcon: '🌧️',
    question: 'What goes up when rain comes down?',
    options: ['An Airplane', 'An Umbrella', 'The Temperature', 'A Rainbow'],
    correctAnswerIndex: 1,
    hint: 'You push this up over your head to stay dry when it starts pouring outside!',
    funFactExplanation: 'Ha! An umbrella ☂️ goes up when the rain comes down! The first umbrellas were invented over 4,000 years ago to provide shade from the sun.',
  },
  {
    id: 'g2-5',
    gradeLevel: '2nd_grade',
    subject: 'wordplay',
    subjectLabel: 'Compound Words',
    subjectIcon: '🧩',
    question: 'When you combine the words "BUTTER" and "FLY", what animal do you get?',
    options: ['A Dragonfly', 'A Butterfly', 'A Housefly', 'A Caterpillar'],
    correctAnswerIndex: 1,
    hint: 'It starts life as a caterpillar before growing colorful wings!',
    funFactExplanation: 'Exact match! Butterfly is a compound word—two smaller words joined together to form an entirely new one!',
  },
  {
    id: 'g2-6',
    gradeLevel: '2nd_grade',
    subject: 'science',
    subjectLabel: 'States of Matter',
    subjectIcon: '🧊',
    question: 'When liquid water freezes into solid ice, what happens to its temperature?',
    options: ['It heats up above 100°F', 'It drops to 32°F (0°C) or below', 'It turns into green slime', 'It stays boiling hot'],
    correctAnswerIndex: 1,
    hint: 'Water must become freezing cold to turn into solid ice cubes.',
    funFactExplanation: 'Spot on! Water freezes at 32 degrees Fahrenheit (0° Celsius). Water is one of the only substances that expands and gets lighter when it freezes!',
  },

  // ==========================================
  // 3RD GRADE (Ages 8-9)
  // ==========================================
  {
    id: 'g3-1',
    gradeLevel: '3rd_grade',
    subject: 'math',
    subjectLabel: 'Multiplication Power',
    subjectIcon: '✖️',
    question: 'A pizza chef cuts 6 pizzas into 8 slices each. How many total pizza slices are there ready to serve?',
    options: ['42 slices', '46 slices', '48 slices', '54 slices'],
    correctAnswerIndex: 2,
    hint: 'Multiply 6 groups of 8: 6 × 8 = ?',
    funFactExplanation: 'Outstanding! 6 × 8 = 48 slices. A fun rhyme to remember this fact: "Six times eight fell on the floor, picked it up it was 48!"',
  },
  {
    id: 'g3-2',
    gradeLevel: '3rd_grade',
    subject: 'science',
    subjectLabel: 'Solar System',
    subjectIcon: '🪐',
    question: 'Which planet in our solar system is famous for having giant, bright rings made of ice and rock orbiting around it?',
    options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'],
    correctAnswerIndex: 2,
    hint: 'It is the 6th planet from the Sun, named after the Roman god of agriculture.',
    funFactExplanation: 'Magnificent! Saturn has thousands of breathtaking rings made of billions of pieces of ice, dust, and rock chunks ranging from pebble-sized to the size of houses!',
  },
  {
    id: 'g3-3',
    gradeLevel: '3rd_grade',
    subject: 'logic',
    subjectLabel: 'Logic Puzzle',
    subjectIcon: '🕵️',
    question: 'Maya is taller than Leo. Leo is taller than Sam. Who is the tallest person among the three?',
    options: ['Sam', 'Leo', 'Maya', 'They are all the same height'],
    correctAnswerIndex: 2,
    hint: 'If Maya > Leo, and Leo > Sam, where does Maya stand compared to Sam?',
    funFactExplanation: 'Sharp deductive reasoning! Since Maya > Leo > Sam, Maya is the tallest! This logical property is called the "Transitive Property" in mathematics.',
  },
  {
    id: 'g3-4',
    gradeLevel: '3rd_grade',
    subject: 'math',
    subjectLabel: 'Fraction Explorer',
    subjectIcon: '🥧',
    question: 'Which fraction represents the biggest amount: 1/2 of a pie, 1/4 of a pie, or 1/8 of a pie?',
    options: ['1/8 of a pie', '1/4 of a pie', '1/2 of a pie', 'They are all equal'],
    correctAnswerIndex: 2,
    hint: 'Remember: When the denominator (bottom number) is smaller, the slices are much BIGGER!',
    funFactExplanation: 'Spot on! 1/2 is half the whole pie! With unit fractions, dividing into fewer pieces means each slice is significantly larger.',
  },
  {
    id: 'g3-5',
    gradeLevel: '3rd_grade',
    subject: 'nature',
    subjectLabel: 'Plant Biology',
    subjectIcon: '🌿',
    question: 'What is the special scientific process called where green plants use sunlight, water, and carbon dioxide to make their own food?',
    options: ['Photosynthesis', 'Metamorphosis', 'Hibernation', 'Evaporation'],
    correctAnswerIndex: 0,
    hint: '"Photo-" means light, and "synthesis" means putting things together!',
    funFactExplanation: 'Phenomenal! Photosynthesis allows plants to produce glucose sugar for energy while releasing fresh Oxygen for all animals and humans to breathe!',
  },
  {
    id: 'g3-6',
    gradeLevel: '3rd_grade',
    subject: 'riddle',
    subjectLabel: 'Tricky Riddle',
    subjectIcon: '🧽',
    question: 'What is full of holes, but can still hold water?',
    options: ['A Net', 'A Sponge', 'A Colander', 'A Sieve'],
    correctAnswerIndex: 1,
    hint: 'You use it at the sink to wash dirty dishes or in the shower!',
    funFactExplanation: 'You nailed it! A sponge 🧽 is full of microscopic pores and pockets that trap water using surface tension.',
  },

  // ==========================================
  // 4TH GRADE (Ages 9-10)
  // ==========================================
  {
    id: 'g4-1',
    gradeLevel: '4th_grade',
    subject: 'math',
    subjectLabel: 'Area & Perimeter',
    subjectIcon: '📐',
    question: 'A rectangular garden has a length of 9 feet and a width of 7 feet. What is the total AREA of the garden in square feet?',
    options: ['32 sq ft', '54 sq ft', '63 sq ft', '72 sq ft'],
    correctAnswerIndex: 2,
    hint: 'Area of a rectangle = Length × Width (9 × 7).',
    funFactExplanation: 'Brilliant work! 9 × 7 = 63 square feet. Perimeter would be 9 + 9 + 7 + 7 = 32 ft, but area measures the inside flat surface!',
  },
  {
    id: 'g4-2',
    gradeLevel: '4th_grade',
    subject: 'science',
    subjectLabel: 'Earth Sciences',
    subjectIcon: '🌋',
    question: 'What do geologists call hot melted liquid rock when it is trapped UNDERGROUND inside the Earth?',
    options: ['Lava', 'Magma', 'Obsidian', 'Granite'],
    correctAnswerIndex: 1,
    hint: 'It only gets called "Lava" once it erupts OUT onto the Earth’s surface!',
    funFactExplanation: 'Super smart! Under the Earth’s crust it is called magma. When a volcano erupts and it flows onto the surface, it is officially called lava!',
  },
  {
    id: 'g4-3',
    gradeLevel: '4th_grade',
    subject: 'wordplay',
    subjectLabel: 'Figurative Language',
    subjectIcon: '✍️',
    question: 'In the sentence "The lightning danced across the dark stormy sky", what literary device is being used?',
    options: ['Hyperbole', 'Personification', 'Alliteration', 'Onomatopoeia'],
    correctAnswerIndex: 1,
    hint: 'Giving human actions (like dancing) to a non-human thing (like lightning)!',
    funFactExplanation: 'Great literary analysis! Personification gives human traits or actions to animals, objects, or weather events to create vivid descriptions.',
  },
  {
    id: 'g4-4',
    gradeLevel: '4th_grade',
    subject: 'logic',
    subjectLabel: 'Lateral Thinking',
    subjectIcon: '💡',
    question: 'A farmer had 17 sheep. All but 9 of them ran away through a broken fence. How many sheep does the farmer have left?',
    options: ['8 sheep', '9 sheep', '17 sheep', '0 sheep'],
    correctAnswerIndex: 1,
    hint: 'Read carefully: "All BUT 9" ran away!',
    funFactExplanation: 'Classic brain teaser trick! "All but 9" means exactly 9 sheep stayed behind with the farmer!',
  },
  {
    id: 'g4-5',
    gradeLevel: '4th_grade',
    subject: 'nature',
    subjectLabel: 'Geography Explorer',
    subjectIcon: '🗺️',
    question: 'Which is the longest river in North America?',
    options: ['Colorado River', 'Mississippi-Missouri River System', 'Hudson River', 'Rio Grande'],
    correctAnswerIndex: 1,
    hint: 'It flows through the heart of the United States down to the Gulf of Mexico!',
    funFactExplanation: 'Terrific! The Missouri River flows over 2,341 miles before joining the Mississippi River, making it the longest river system on the continent.',
  },
  {
    id: 'g4-6',
    gradeLevel: '4th_grade',
    subject: 'math',
    subjectLabel: 'Place Value',
    subjectIcon: '🔢',
    question: 'In the number 48,251, what is the PLACE VALUE of the digit 8?',
    options: ['80', '800', '8,000 (Thousands)', '80,000'],
    correctAnswerIndex: 2,
    hint: 'Count positions from right to left: Ones (1), Tens (5), Hundreds (2), Thousands (8)...',
    funFactExplanation: 'Spot on! The digit 8 sits in the thousands place, so its value is 8,000!',
  },

  // ==========================================
  // 5TH GRADE (Ages 10-11)
  // ==========================================
  {
    id: 'g5-1',
    gradeLevel: '5th_grade',
    subject: 'math',
    subjectLabel: 'Decimals & Order',
    subjectIcon: '📊',
    question: 'Solve this math expression using the correct Order of Operations (PEMDAS): 5 + 3 × (8 - 2)',
    options: ['48', '23', '30', '19'],
    correctAnswerIndex: 1,
    hint: 'Parentheses first: (8 - 2) = 6. Then multiply: 3 × 6 = 18. Finally add 5!',
    funFactExplanation: 'Outstanding! PEMDAS: 8 - 2 = 6, then 3 × 6 = 18, then 5 + 18 = 23. Order of operations prevents any mathematical ambiguity!',
  },
  {
    id: 'g5-2',
    gradeLevel: '5th_grade',
    subject: 'science',
    subjectLabel: 'Physics & Energy',
    subjectIcon: '⚡',
    question: 'When a roller coaster car climbs to the very top of a massive hill and pauses for a second, what type of energy is stored at its maximum?',
    options: ['Kinetic Energy', 'Gravitational Potential Energy', 'Thermal Energy', 'Nuclear Energy'],
    correctAnswerIndex: 1,
    hint: 'Potential energy is "stored" energy waiting to be released as motion!',
    funFactExplanation: 'Spot on! At the peak, potential energy is at its highest. As it plunges downward, gravity converts it into kinetic energy (energy of motion)!',
  },
  {
    id: 'g5-3',
    gradeLevel: '5th_grade',
    subject: 'logic',
    subjectLabel: 'Word Analogy',
    subjectIcon: '🧠',
    question: 'Complete the analogy: BIRD is to FLOCK as FISH is to ______?',
    options: ['HERD', 'PACK', 'SCHOOL', 'SWARM'],
    correctAnswerIndex: 2,
    hint: 'What do we call a large group of fish swimming synchronized together?',
    funFactExplanation: 'Excellent! A group of fish is called a school (or shoal)! Similarly, wolves form packs and bees form swarms.',
  },
  {
    id: 'g5-4',
    gradeLevel: '5th_grade',
    subject: 'riddle',
    subjectLabel: 'Mystery Riddle',
    subjectIcon: '🕯️',
    question: 'I am tall when I am young, and I am short when I am old. What am I?',
    options: ['A Tree', 'A Candle', 'A Pencil', 'Both B and C are correct'],
    correctAnswerIndex: 3,
    hint: 'Think about things that get burned down or sharpened away with use!',
    funFactExplanation: 'Genius! Both candles 🕯️ and pencils ✏️ start out tall and shrink shorter the more you use them!',
  },
  {
    id: 'g5-5',
    gradeLevel: '5th_grade',
    subject: 'nature',
    subjectLabel: 'Human Body Systems',
    subjectIcon: '🫀',
    question: 'Which vital organ in the human body pumps oxygen-rich blood through more than 60,000 miles of blood vessels?',
    options: ['The Brain', 'The Stomach', 'The Heart', 'The Liver'],
    correctAnswerIndex: 2,
    hint: 'It beats about 100,000 times each single day without ever stopping to rest!',
    funFactExplanation: 'Incredible! The heart pumps approximately 2,000 gallons of blood every day! If you stretched all your blood vessels in a line, they would circle the globe twice.',
  },
  {
    id: 'g5-6',
    gradeLevel: '5th_grade',
    subject: 'math',
    subjectLabel: 'Volume Master',
    subjectIcon: '📦',
    question: 'A storage cube box measures 4 inches long, 4 inches wide, and 4 inches high. What is its total VOLUME in cubic inches?',
    options: ['16 cu in', '48 cu in', '64 cu in', '84 cu in'],
    correctAnswerIndex: 2,
    hint: 'Volume of a cube = side × side × side (4 × 4 × 4).',
    funFactExplanation: 'Perfection! 4 × 4 = 16, and 16 × 4 = 64 cubic inches (4³).',
  },

  // ==========================================
  // MIDDLE SCHOOL (6th-8th Grade / Ages 11-14)
  // ==========================================
  {
    id: 'ms-1',
    gradeLevel: 'middle_school',
    subject: 'math',
    subjectLabel: 'Algebra Mystery',
    subjectIcon: '🔣',
    question: 'Solve for the mystery variable x: 3x + 7 = 28. What is the value of x?',
    options: ['x = 5', 'x = 7', 'x = 9', 'x = 21'],
    correctAnswerIndex: 1,
    hint: 'First subtract 7 from both sides: 3x = 21. Then divide by 3!',
    funFactExplanation: 'Awesome algebra! 28 - 7 = 21, and 21 ÷ 3 = 7. The word "Algebra" comes from the Arabic word "al-jabr" meaning "reunion of broken parts".',
  },
  {
    id: 'ms-2',
    gradeLevel: 'middle_school',
    subject: 'science',
    subjectLabel: 'Chemistry & Elements',
    subjectIcon: '🧪',
    question: 'What gas makes up approximately 78% of Earth’s atmosphere (the air we breathe)?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
    correctAnswerIndex: 2,
    hint: 'Most people guess Oxygen, but Oxygen is only about 21%!',
    funFactExplanation: 'Fascinating science! Earth’s atmosphere is ~78% Nitrogen, ~21% Oxygen, and ~1% Argon and trace gases. Nitrogen keeps our atmosphere stable and safe.',
  },
  {
    id: 'ms-3',
    gradeLevel: 'middle_school',
    subject: 'logic',
    subjectLabel: 'Deductive Reasoning',
    subjectIcon: '⚖️',
    question: 'If two typists can type two pages in two minutes, how many typists would it take to type 18 pages in six minutes?',
    options: ['3 typists', '6 typists', '9 typists', '12 typists'],
    correctAnswerIndex: 1,
    hint: 'Calculate rate per typist: 2 typists do 2 pages in 2 mins = 1 page per minute total, so 1 typist types 0.5 pages/min.',
    funFactExplanation: 'Brilliant deduction! One typist types 0.5 pages per minute. In 6 minutes, one typist types 3 pages. To produce 18 pages in 6 minutes: 18 ÷ 3 = 6 typists!',
  },
  {
    id: 'ms-4',
    gradeLevel: 'middle_school',
    subject: 'nature',
    subjectLabel: 'Genetics & Life',
    subjectIcon: '🧬',
    question: 'What is the master genetic molecule shaped like a double-helix twisted ladder that holds instructions for all living things?',
    options: ['RNA', 'DNA (Deoxyribonucleic Acid)', 'ATP', 'Glucose'],
    correctAnswerIndex: 1,
    hint: 'Discovered structurally by Watson, Crick, and Rosalind Franklin in the 1950s.',
    funFactExplanation: 'Spot on! DNA contains the biological code for every living organism. If uncoiled, the DNA in a single human cell would measure over 6 feet long!',
  },
  {
    id: 'ms-5',
    gradeLevel: 'middle_school',
    subject: 'riddle',
    subjectLabel: 'Lateral Thinking',
    subjectIcon: '⛵',
    question: 'A boat sits in the harbor with a rope ladder hanging over the side. The ladder rungs are 1 foot apart. If the tide rises by 4 feet, how many rungs will be underwater?',
    options: ['4 rungs', '8 rungs', 'None (the boat floats up with the tide)', '2 rungs'],
    correctAnswerIndex: 2,
    hint: 'Think about physics: What happens to a floating boat when the water level rises?',
    funFactExplanation: 'Gotcha! The boat floats on top of the water! As the tide rises 4 feet, the boat and ladder rise 4 feet with it, so no extra rungs submerge.',
  },
  {
    id: 'ms-6',
    gradeLevel: 'middle_school',
    subject: 'science',
    subjectLabel: 'Speed of Light',
    subjectIcon: '⚡',
    question: 'How long does it take for light emitted from the Sun to travel 93 million miles and reach Earth?',
    options: ['Instantaneous (0 seconds)', 'About 8 minutes and 20 seconds', '1 hour', '1 full day (24 hours)'],
    correctAnswerIndex: 1,
    hint: 'Light travels at 186,282 miles per second. 93,000,000 ÷ 186,282 ≈ 500 seconds.',
    funFactExplanation: 'Mind-blowing physics! Sunlight takes ~8 minutes and 20 seconds (500 seconds) to reach us. When you look at the daytime sky, you are seeing the Sun as it looked 8 minutes ago!',
  },

  // ==========================================
  // HIGH SCHOOL (9th-12th Grade / Ages 14-18)
  // ==========================================
  {
    id: 'hs-1',
    gradeLevel: 'high_school',
    subject: 'math',
    subjectLabel: 'Pythagorean Theorem',
    subjectIcon: '📐',
    question: 'A right triangle has legs of lengths a = 6 and b = 8. What is the length of the hypotenuse c?',
    options: ['c = 9', 'c = 10', 'c = 12', 'c = 14'],
    correctAnswerIndex: 1,
    hint: 'Pythagorean Theorem: a² + b² = c². 6² + 8² = 36 + 64 = 100. √100 = ?',
    funFactExplanation: 'Masterful! 6² + 8² = 36 + 64 = 100, and √100 = 10. This is a scaled multiple of the famous 3-4-5 Pythagorean triple!',
  },
  {
    id: 'hs-2',
    gradeLevel: 'high_school',
    subject: 'science',
    subjectLabel: 'Quantum & Particle Physics',
    subjectIcon: '⚛️',
    question: 'Which subatomic particle orbits the atomic nucleus and possesses a negative electrical charge?',
    options: ['Proton', 'Neutron', 'Electron', 'Photon'],
    correctAnswerIndex: 2,
    hint: 'Protons have a positive charge, neutrons are neutral, and these tiny particles carry the negative charge.',
    funFactExplanation: 'Spot on! Electrons carry a -1 elementary charge and are about 1,836 times less massive than protons. Their movement is the foundation of all electrical currents!',
  },
  {
    id: 'hs-3',
    gradeLevel: 'high_school',
    subject: 'logic',
    subjectLabel: 'Game Theory & Paradox',
    subjectIcon: '🎲',
    question: 'In the Monty Hall problem with 3 doors (1 car, 2 goats), after you choose a door and the host reveals a goat behind one of the other two, what are your chances of winning if you SWITCH?',
    options: ['1/3 (33%)', '1/2 (50%)', '2/3 (66.7%)', '3/4 (75%)'],
    correctAnswerIndex: 2,
    hint: 'Your original door only had a 1/3 chance of winning, meaning there was a 2/3 chance the car was behind one of the other two doors!',
    funFactExplanation: 'Counterintuitive genius! Switching doubles your odds from 1/3 to 2/3! Because Monty always reveals a goat, the remaining unpicked door inherits all 2/3 probability.',
  },
  {
    id: 'hs-4',
    gradeLevel: 'high_school',
    subject: 'nature',
    subjectLabel: 'Cellular Respiration',
    subjectIcon: '🔋',
    question: 'Which cellular organelle is known as the "powerhouse of the cell" because it generates most of the chemical energy needed via ATP synthesis?',
    options: ['Ribosome', 'Mitochondria', 'Golgi Apparatus', 'Endoplasmic Reticulum'],
    correctAnswerIndex: 1,
    hint: 'Mitochondria have their own unique circular DNA inherited maternally from your mother!',
    funFactExplanation: 'Classic biology! Mitochondria generate Adenosine Triphosphate (ATP) via aerobic cellular respiration, fueling virtually every biochemical reaction in human cells.',
  },
  {
    id: 'hs-5',
    gradeLevel: 'high_school',
    subject: 'wordplay',
    subjectLabel: 'Philosophy & Logic',
    subjectIcon: '🏛️',
    question: 'What logical fallacy occurs when someone attacks their opponent’s character or personal traits instead of engaging with their actual argument?',
    options: ['Straw Man', 'Ad Hominem', 'Slippery Slope', 'Post Hoc Ergo Propter Hoc'],
    correctAnswerIndex: 1,
    hint: 'Latin for "to the person" or "against the man".',
    funFactExplanation: 'Sharp rhetorical analysis! "Ad hominem" arguments bypass the factual merits of a claim by attacking personal motives, background, or identity instead.',
  },
  {
    id: 'hs-6',
    gradeLevel: 'high_school',
    subject: 'math',
    subjectLabel: 'Combinatorics',
    subjectIcon: '🔢',
    question: 'How many different ways can 4 runners finish in 1st, 2nd, 3rd, and 4th place in a sprint race (4 factorial, or 4!)?',
    options: ['12 ways', '16 ways', '24 ways', '32 ways'],
    correctAnswerIndex: 2,
    hint: '4! = 4 × 3 × 2 × 1 = ?',
    funFactExplanation: 'Spot on! 4 × 3 × 2 × 1 = 24 unique permutations. Combinatorics and factorials grow astonishingly fast—just 10! is over 3.6 million combinations!',
  },
];

export function getGradeLevelInfo(gradeLevel?: GradeLevel): GradeLevelInfo {
  if (!gradeLevel || !GRADE_LEVELS[gradeLevel]) {
    return GRADE_LEVELS['1st_grade'];
  }
  return GRADE_LEVELS[gradeLevel];
}

export function getTeasersForGrade(gradeLevel: GradeLevel): BrainTeaser[] {
  const teasers = BRAIN_TEASERS_CATALOG.filter((t) => t.gradeLevel === gradeLevel);
  if (teasers.length === 0) {
    return BRAIN_TEASERS_CATALOG.filter((t) => t.gradeLevel === '1st_grade');
  }
  return teasers;
}

export const DEFAULT_BRAIN_TEASER_DAILY_LIMIT = 1;

/**
 * Deterministically retrieves the Daily Brain Teaser for a kid based on date, assigned grade level, and question index.
 */
export function getDailyTeaserForKid(kid: KidProfile, dateStr?: string, questionIndex: number = 0): BrainTeaser {
  const grade = kid.gradeLevel || '1st_grade';
  const teasers = getTeasersForGrade(grade);
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  // Hash the date string to select a daily starting index
  let hash = 0;
  for (let i = 0; i < targetDate.length; i++) {
    hash = (hash << 5) - hash + targetDate.charCodeAt(i);
    hash |= 0;
  }
  const baseIndex = Math.abs(hash) % teasers.length;
  const index = (baseIndex + Math.max(0, questionIndex)) % teasers.length;
  return teasers[index];
}

/**
 * Cycles to the next available teaser in the grade level for practice mode.
 */
export function getNextTeaser(gradeLevel: GradeLevel, currentTeaserId: string): BrainTeaser {
  const teasers = getTeasersForGrade(gradeLevel);
  const currentIndex = teasers.findIndex((t) => t.id === currentTeaserId);
  const nextIndex = (currentIndex + 1) % teasers.length;
  return teasers[nextIndex];
}

/**
 * Returns how many brain teaser questions the child has completed today.
 */
export function getDailyTeasersAnsweredToday(kid: KidProfile, dateStr?: string): number {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  if (kid.brainTeaserHistory?.lastCompletedDate !== targetDate) {
    return 0;
  }
  return kid.brainTeaserHistory.todayAnsweredCount ?? 1;
}

/**
 * Checks if the kid has already completed today's teaser challenge.
 */
export function hasCompletedDailyTeaser(kid: KidProfile, dateStr?: string): boolean {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  return kid.brainTeaserHistory?.lastCompletedDate === targetDate;
}

/**
 * Checks if the kid has reached the admin-configured daily limit for brain teasers.
 */
export function hasReachedDailyTeaserLimit(
  kid: KidProfile,
  dailyLimit: number = DEFAULT_BRAIN_TEASER_DAILY_LIMIT,
  dateStr?: string
): boolean {
  const answeredToday = getDailyTeasersAnsweredToday(kid, dateStr);
  return answeredToday >= dailyLimit;
}
