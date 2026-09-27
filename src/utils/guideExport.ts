import { jsPDF } from 'jspdf';

export interface GuideExportData {
  title: string;
  version: string;
}

export function generateGuidePDF(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  let y = 20;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 20;
    }
  };

  // Header Banner
  doc.setFillColor(49, 46, 129); // Indigo 900
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('CHOREQUEST: FAMILY INSTRUCTION GUIDE', margin + 6, y + 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(254, 240, 138); // Yellow 200
  doc.text('Master 2026 Edition • Chores, KidCoin, Camera, Meals, Calendar & Raspberry Pi 5', margin + 6, y + 17);

  y += 31;

  // Introduction
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Welcome to ChoreQuest!', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const introText =
    'ChoreQuest turns daily family responsibilities into an engaging, gamified adventure. Kids earn stars for completing morning, afternoon, and evening missions, grow their KidCoin digital savings with compound interest, and redeem rewards. Parents maintain complete authority over schedules, time restrictions, meal planning, and security camera streams—all hosted privately on your home Wi-Fi.';
  const introLines = doc.splitTextToSize(introText, contentWidth);
  doc.text(introLines, margin, y);
  y += introLines.length * 4.2 + 5;

  // Helper for section header banner
  const renderSectionHeader = (title: string, r: number, g: number, b: number, textR: number, textG: number, textB: number) => {
    checkPageBreak(25);
    y += 2;
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, y, contentWidth, 7.5, 2, 2, 'F');
    doc.setTextColor(textR, textG, textB);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, margin + 4, y + 5.2);
    y += 10.5;
  };

  // Helper for numbered items
  const renderNumberedList = (items: { num: string; title: string; desc: string }[], circleR = 238, circleG = 242, circleB = 255, numR = 67, numG = 56, numB = 202) => {
    items.forEach((step) => {
      checkPageBreak(15);
      doc.setFillColor(circleR, circleG, circleB);
      doc.circle(margin + 4, y + 3, 3.2, 'F');
      doc.setTextColor(numR, numG, numB);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(step.num, margin + 2.8, y + 4.1);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(step.title, margin + 10, y + 3.8);
      y += 5.2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(step.desc, contentWidth - 11);
      doc.text(lines, margin + 10, y);
      y += lines.length * 3.8 + 2.5;
    });
  };

  // SECTION 1: KIDS GUIDE
  renderSectionHeader('PART 1: THE KID MISSION HANDBOOK (How to Play & Earn)', 254, 243, 199, 146, 64, 14);
  renderNumberedList([
    {
      num: '1',
      title: 'Choose Your Avatar & Profile',
      desc: 'Tap your name card on the home screen. Pick your favorite emoji, colors, and watch your level progress from Level 1 Novice to Level 5 Champion!',
    },
    {
      num: '2',
      title: "Check Today's Assigned Missions",
      desc: 'Browse daily chore cards with star values (⭐ 1-10 points), estimated focus times, and step-by-step subtask checklists.',
    },
    {
      num: '3',
      title: 'Watch the Check-Off Time Frames! ⏰',
      desc: 'Chores have scheduled active hours: Morning (6am–11am), Afternoon (12pm–7pm), and Evening (6pm–9:30pm). Tasks stay locked outside active hours.',
    },
    {
      num: '4',
      title: 'Complete Tasks & Celebrate 🎉',
      desc: 'When finished, tap the big green checkmark to trigger victory audio chimes, confetti bursts, and instant star credits.',
    },
    {
      num: '5',
      title: 'Use the Built-In Focus Stopwatch ⏱️',
      desc: 'Tap the stopwatch icon on any chore for a 5, 10, 15, or 30-minute focus countdown with motivational audio chimes.',
    },
    {
      num: '6',
      title: 'Can\'t Finish? Give a Polite Reason',
      desc: 'If you are sick, out of cleaning supplies, or need help, tap "Can\'t Complete" to notify Mom and Lex with a courteous reason.',
    },
    {
      num: '7',
      title: 'Spin the Chore Roulette Wheel 🎡',
      desc: 'Can\'t decide what task to do first? Tap "Spin Wheel" to let ChoreQuest randomly select a fun mission for you!',
    },
    {
      num: '8',
      title: 'Reading Log Adventure & Badges 📚',
      desc: 'Record reading minutes and book titles. Level up your reading streak and unlock achievements (Bookworm, Speed Reader, Master Scholar).',
    },
  ]);

  // SECTION 2: PARENTS COMMAND GUIDE
  renderSectionHeader('PART 2: PARENT COMMAND & ADMIN CONTROLS', 224, 231, 255, 49, 46, 129);
  renderNumberedList(
    [
      {
        num: '1',
        title: 'Parent PIN Authentication',
        desc: 'Access the Parent Dashboard with your 4-digit PIN (Default: 1234). You can change this anytime under Parent Settings.',
      },
      {
        num: '2',
        title: 'Managing Chores & Assignees',
        desc: 'Create or archive chores, set star payouts (1-20+ points), assign to all kids or specific individuals, and add checklists.',
      },
      {
        num: '3',
        title: 'Category Check-Off Time Frames',
        desc: 'In Chores & Categories, set allowed completion hours per category (e.g. Morning 6am–11am). Locks completion outside allowed hours.',
      },
      {
        num: '4',
        title: 'Customizing Star Costs for Snacks & Treats',
        desc: 'Under the Rewards tab, edit required star values for each snack, dessert, or privilege to match your family rules.',
      },
      {
        num: '5',
        title: 'Verifying Chores & Activity Logs',
        desc: 'Review completed chores, view completion timestamps, award bonus stars, and see why any chores were skipped.',
      },
      {
        num: '6',
        title: 'Kitchen Wall Kiosk Mode 📺',
        desc: 'Mount an iPad or touchscreen in the kitchen. Launch Kiosk Mode for an ambient scoreboard with MVP leaderboards and chimes.',
      },
    ],
    254,
    226,
    226,
    185,
    28,
    28
  );

  // SECTION 3: KIDCOIN & SAVINGS MISSIONS
  renderSectionHeader('PART 3: KIDCOIN FINANCIAL SYSTEM & ROCKET SAVINGS', 209, 250, 229, 6, 95, 70);
  renderNumberedList(
    [
      {
        num: '1',
        title: 'Digital Piggy Bank & Balance',
        desc: 'KidCoin bridges chore stars and real-world allowance. Kids track balances, view deposits, and learn basic accounting.',
      },
      {
        num: '2',
        title: 'Interactive Rocket Savings Missions 🚀',
        desc: 'Kids set personal savings goals (toys, bikes, games). An interactive rocket fuels up as they save and launches when reached!',
      },
      {
        num: '3',
        title: 'Weekly Compound Interest 📈',
        desc: 'Parents can enable weekly interest (e.g. 5% or 10%). Shows children how patience and saving money generates extra income.',
      },
      {
        num: '4',
        title: 'Allowance & Star Conversion 💳',
        desc: 'Set custom exchange rates (e.g. 10 Stars = $1.00). Kids choose whether to cash out for snacks or save for big goals.',
      },
    ],
    209,
    250,
    229,
    4,
    120,
    87
  );

  // SECTION 4: REWARDS, SNACK REQUESTS & FAMILY GOALS
  renderSectionHeader('PART 4: REWARDS, SNACK REQUESTS & FAMILY GOALS', 252, 231, 243, 157, 23, 77);
  renderNumberedList(
    [
      {
        num: '1',
        title: 'The Reward Store',
        desc: 'Redeem stars for screen time, allowance, outings, or custom rewards configured by parents in the admin settings.',
      },
      {
        num: '2',
        title: 'Kid Snack & Treat Requests 🍪',
        desc: 'Kids submit snack requests directly to parents. Parents review in the admin queue, check star balances, and approve or decline.',
      },
      {
        num: '3',
        title: 'Shared Family Goals (Teamwork Meter) 🏆',
        desc: 'Pool stars together for a Family Pizza Night (100 Stars) or Water Park Trip (250 Stars) to foster household cooperation!',
      },
      {
        num: '4',
        title: 'Mind Quest Brain Teasers & Trivia 🧠',
        desc: 'Daily logic puzzles and trivia challenges award bonus stars, with the Top Brains Leaderboard spotlighting top solvers.',
      },
    ],
    253,
    242,
    248,
    190,
    24,
    93
  );

  // SECTION 5: CALENDAR, MEALS & GROCERY
  renderSectionHeader('PART 5: FAMILY CALENDAR, MEALS & SMART GROCERY', 207, 250, 254, 14, 116, 144);
  renderNumberedList(
    [
      {
        num: '1',
        title: 'Unified Family Calendar 📅',
        desc: 'Schedule appointments, soccer practices, school holidays, and chores in one unified calendar with optional Google Calendar sync.',
      },
      {
        num: '2',
        title: 'Weekly Meal Planner & Recipes 🍳',
        desc: 'Plan breakfasts, lunches, and dinners from Mon-Sun. Open recipe cards for ingredients, cooking instructions, and prep times.',
      },
      {
        num: '3',
        title: 'Categorized Grocery List 🛒',
        desc: 'Organized by aisle (Produce, Dairy, Meat, Pantry). Ingredients from your planned meals can be added with a single tap.',
      },
      {
        num: '4',
        title: 'Barcode Scanning & Receipt Import 🔍',
        desc: 'Scan barcodes with your device camera for instant product lookup. Import store receipts for automated expense tracking.',
      },
    ],
    207,
    250,
    254,
    14,
    116,
    144
  );

  // SECTION 6: FRONT DOOR CAMERA & KIOSK
  renderSectionHeader('PART 6: FRONT DOOR CAMERA & KIOSK INTEGRATION', 237, 233, 254, 91, 33, 182);
  renderNumberedList(
    [
      {
        num: '1',
        title: 'Aqara G400 + go2rtc Streaming 📹',
        desc: 'Connect to local go2rtc on Raspberry Pi (:1984) for fast WebRTC live video with zero monthly cloud fees.',
      },
      {
        num: '2',
        title: 'iPadOS Kiosk Resilience & MJPEG Fallback 🛡️',
        desc: 'Auto-appends &muted=1 for Safari autoplay. Easily switch to MJPEG (/api/stream.mjpeg) if WebRTC pauses during kiosk sleep.',
      },
      {
        num: '3',
        title: 'Two-Way Voice Broadcast & Chimes 📢',
        desc: 'Broadcast pre-recorded dinner announcements and visitor alerts directly to children on kiosk and mobile displays.',
      },
      {
        num: '4',
        title: 'Daylight, IR Night Vision & Snapshots 🌙',
        desc: 'Switch between color and infrared night modes with one tap. Capture high-res live snapshots and download instantly.',
      },
    ],
    243,
    232,
    255,
    109,
    40,
    217
  );

  // SECTION 7: TIME FRAME CHEAT SHEET
  renderSectionHeader('PART 7: RECOMMENDED TIME WINDOW SCHEDULE', 254, 242, 242, 159, 18, 57);
  const timeSchedules = [
    { name: '🌅 Morning Missions', hours: '06:00 AM – 11:00 AM', examples: 'Make bed, brush teeth, breakfast, backpack ready' },
    { name: '🏫 After School', hours: '03:00 PM – 06:00 PM', examples: 'Homework, unpack lunchbox, pet feeding, shoes away' },
    { name: '☀️ Afternoon Tasks', hours: '12:00 PM – 07:00 PM', examples: 'Clean room, tidy toys, yard chores, take out trash' },
    { name: '🌙 Evening & Bedtime', hours: '06:00 PM – 09:30 PM', examples: 'Dishes, pajamas on, bath/shower, lights out routine' },
  ];

  timeSchedules.forEach((item) => {
    checkPageBreak(12);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 10, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(item.name, margin + 3, y + 4.2);

    doc.setTextColor(67, 56, 202);
    doc.text(item.hours, margin + 55, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Examples: ${item.examples}`, margin + 3, y + 8);

    y += 11.5;
  });

  // SECTION 8: RASPBERRY PI 5 & LOCAL HOSTING
  renderSectionHeader('PART 8: RASPBERRY PI 5 & HOME WI-FI SETUP', 236, 253, 245, 6, 95, 70);
  const piSteps = [
    '1. Connect your Raspberry Pi 5 to your home router via Wi-Fi or Ethernet cable.',
    '2. Any family device on your Wi-Fi can open: http://raspberrypi.local:3000 or http://<PI-IP>:3000',
    '3. On iOS Safari or Android Chrome, tap "Add to Home Screen" to install it as an app icon.',
    '4. Autostart 24/7 terminal command: npm run build && node dist/server.cjs',
    '5. 100% Private: All logs, kid profiles, KidCoin balances, and camera feeds stay inside your home network.',
  ];

  piSteps.forEach((step) => {
    checkPageBreak(7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(step, margin + 2, y);
    y += 5;
  });

  // Page Numbers Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`ChoreQuest Family Instruction Guide • Page ${i} of ${totalPages}`, margin, pageHeight - 8);
    doc.text('Local Network Edition • Raspberry Pi 5', pageWidth - margin - 55, pageHeight - 8);
  }

  doc.save('ChoreQuest-Family-Instruction-Guide.pdf');
}

export function generateGuideMarkdown(): string {
  return `# 🌟 ChoreQuest: Family Instruction Guide
*The Official Master Handbook for Children & Parents • Raspberry Pi & Home Server*

---

## 📖 Welcome to ChoreQuest!
ChoreQuest turns daily family responsibilities into an engaging, gamified adventure. Kids earn stars for completing morning, afternoon, and evening missions, grow their KidCoin digital savings with compound interest, and redeem rewards. Parents maintain complete authority over schedules, time restrictions, meal planning, and security camera streams—all hosted privately on your home Wi-Fi.

---

## 👦👧 PART 1: THE KID MISSION HANDBOOK (How to Play & Earn)

### 1. Pick Your Kid Avatar & Profile
- Tap your name card on the home screen.
- Personalize your avatar with your favorite emoji and colors.
- Watch your level progress from **Level 1 Novice** to **Level 5 Champion** as you earn lifetime stars!

### 2. Check Today's Assigned Missions
- Browse your chores for today.
- Each chore displays its **Star Value** (⭐ 1 to 10 points) and estimated focus time.
- Check off subtasks one-by-one if a task has multiple steps.

### 3. Mind the Category Check-Off Time Frames! ⏰
- **🌅 Morning Tasks (06:00 AM – 11:00 AM)**: Make bed, brush teeth, eat breakfast, pack school bag.
- **☀️ Afternoon Tasks (12:00 PM – 07:00 PM)**: Clean room, tidy toys, pet care, homework.
- **🌙 Evening Tasks (06:00 PM – 09:30 PM)**: Dishes, tidy living room, pajamas, bedtime reading.
- *Notice:* Chores are locked outside of these scheduled hours to keep our family on a healthy routine!

### 4. Completing Tasks & Earning Stars
- Tap the **Complete** button when you finish your mission.
- Listen for the victory chime, watch the confetti burst, and your stars will be awarded immediately!

### 5. Using the Focus Stopwatch ⏱️
- Tap the stopwatch icon on any chore to start a 5, 10, 15, or 30-minute focus countdown.
- Work until the chime sounds to beat the clock!

### 6. Can't Complete a Chore? Give a Polite Reason
- If you are sick, supplies are empty, or you need parent help, tap "Can't Complete".
- Choose a courteous explanation so parents understand why the task was skipped.

### 7. Spin the Chore Roulette Wheel 🎡
- Can't decide what chore to tackle first? Tap "Spin Wheel" to let ChoreQuest choose for you!

### 8. Reading Log Adventure & Badges 📚
- Log your daily reading minutes and book titles.
- Unlock reading achievements (Bookworm, Speed Reader, Master Scholar) and earn bonus stars!

---

## 🛡️ PART 2: PARENT COMMAND & ADMIN CONTROLS

### 1. Parent PIN Access
- Default Parent PIN: \`1234\`.
- Change this anytime in Parent Settings to keep admin features private.

### 2. Managing Chores & Assignees
- Add, edit, or archive chores anytime.
- Assign chores to all kids or specific siblings.
- Set custom star values (1 to 20+ points) and bounty bonuses for difficult chores.

### 3. Category Check-Off Time Frames
- Go to the **Chores & Categories** tab in the Parent Dashboard.
- Set exact allowed check-off windows (e.g. Morning: 6am–11am, Afternoon: 12pm–7pm).
- Outside of these hours, completion is locked on the kid cards and Kiosk display.
- One-click presets make scheduling effortless (Morning, Afternoon, Evening, After School).

### 4. Setting Star Costs for Snacks & Treats
- Under the Rewards tab, edit the star cost for each treat, dessert, or privilege.
- Ensure the star cost accurately reflects your household value system!

### 5. Verifying Chores & Activity Logs
- Review today's completed chores in the Activity Log.
- Verify completions, award bonus stars, and see why any chores were skipped.

### 6. Kitchen Wall Kiosk Mode 📺
- Tap Kiosk Mode in the navigation menu.
- Perfect for an old iPad, Android tablet, or Raspberry Pi touchscreen mounted on the kitchen wall!

---

## 🚀 PART 3: KIDCOIN FINANCIAL SYSTEM & ROCKET SAVINGS

### 1. What is KidCoin? 🪙
- KidCoin is your family's private digital currency teaching financial responsibility.
- Kids track their total balance, review deposits from completed chore missions, and learn basic accounting.

### 2. Interactive Rocket Savings Missions
- Kids set savings targets (toys, bicycles, games, trips).
- As they save KidCoins, an interactive rocket fuels up on their screen and initiates a launch celebration when reached!

### 3. Weekly Compound Interest 📈
- Teach children the power of compounding! Parents can set weekly compound interest (e.g., 5% or 10%).
- Demonstrates how patience and long-term saving generates extra passive income.

### 4. Allowance & Star Conversion 💳
- Establish exchange rates (e.g. 10 Stars = $1.00).
- Kids choose whether to cash out for immediate snacks or deposit into their long-term savings.

---

## 🍪 PART 4: REWARDS, SNACK REQUESTS & FAMILY GOALS

### 1. The Reward Store 🎁
- Trade stars for screen time, allowance, outings, or custom rewards created by parents.

### 2. Kid Snack & Treat Requests 🍪
- Kids browse the snack catalog and send requests directly to parents.
- Parents review requests in the admin queue, check star balances, and approve or decline with a personal note.

### 3. Shared Family Goals (Teamwork Meter) 🏆
- Pool stars together for a Family Pizza Night (100 Stars) or Water Park Trip (250 Stars).
- Fosters teamwork among siblings!

### 4. Mind Quest Brain Teasers & Trivia 🧠
- Daily and weekly logic riddles and trivia questions award bonus stars.
- Top Brains Leaderboard spotlights the week's sharpest thinkers.

---

## 🍽️ PART 5: FAMILY CALENDAR, MEALS & SMART GROCERY

### 1. Unified Family Calendar 📅
- Track sports practices, school events, birthdays, and chores in one place with optional Google Calendar sync.

### 2. Weekly Meal Planner & Recipes 🍳
- Plan breakfasts, lunches, and dinners from Monday to Sunday.
- Review ingredient lists, prep times, and step-by-step cooking instructions.

### 3. Categorized Grocery Shopping List 🛒
- Organized by aisle (Produce, Dairy, Meat, Pantry) for fast shopping trips.
- Add ingredients directly from planned meals with one tap.

### 4. Barcode Scanning & Receipt Import 🔍
- Scan retail barcodes directly with your device's camera.
- Import store receipts for automatic pricing estimates and pantry check-offs.

---

## 📹 PART 6: FRONT DOOR CAMERA & KIOSK INTEGRATION

### 1. Aqara G400 + go2rtc Streaming
- Stream live camera video on your local network using go2rtc on Raspberry Pi (:1984).
- 100% private, zero cloud subscription fees.

### 2. iPadOS Kiosk Resilience & MJPEG Fallback 🛡️
- Auto-appends \`&muted=1\` so iOS Safari allows autoplay.
- Single-tap fallback on the camera HUD to MJPEG streaming (\`/api/stream.mjpeg\`) if WebRTC pauses during iPad sleep.

### 3. Two-Way Voice Broadcast & Chimes 📢
- Broadcast announcements to kids ("Someone is at the front door! 🚪", "Dinner is ready! 🍽️") with audible chimes.

### 4. Daylight & IR Night Vision Modes 🌙
- Toggle between full-color daylight and infrared night vision. Take live snapshots and download them directly.

---

## ⏰ PART 7: RECOMMENDED TIME WINDOW SCHEDULE

| Category | Time Window | Typical Activities |
|---|---|---|
| 🌅 Morning Missions | 06:00 AM – 11:00 AM | Make bed, teeth, breakfast, backpack ready |
| 🏫 After School | 03:00 PM – 06:00 PM | Homework, lunchbox unpack, pet feeding |
| ☀️ Afternoon Tasks | 12:00 PM – 07:00 PM | Clean room, tidy toys, yard work, trash |
| 🌙 Evening & Bedtime | 06:00 PM – 09:30 PM | Dinner dishes, pajamas, reading, bedtime |

---

## 🍓 PART 8: RASPBERRY PI 5 & HOME WI-FI SETUP

1. **Local Access URLs:**
   - \`http://raspberrypi.local:3000\`
   - \`http://<PI-IP>:3000\` (run \`hostname -I\` in terminal)
2. **Add to Mobile Home Screen (PWA):**
   - iOS Safari: Tap Share → "Add to Home Screen"
   - Android Chrome: Tap 3-dots → "Install App" or "Add to Home Screen"
3. **24/7 Autostart Command:**
   \`\`\`bash
   npm run build && node dist/server.cjs
   \`\`\`
4. **100% Local Privacy:**
   - All logs, kid profiles, KidCoin balances, and camera streams stay completely inside your home network.
   - Zero monthly subscription fees forever!
`;
}

export function downloadFile(content: string, fileName: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateGuideHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ChoreQuest: Family Instruction Guide</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f8fafc;
    }
    .guide-card {
      background: #ffffff;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    h1 { color: #312e81; font-size: 28px; margin-bottom: 6px; }
    h2 { color: #1e1b4b; border-bottom: 2px solid #fde047; padding-bottom: 8px; margin-top: 36px; font-size: 20px; }
    h3 { color: #4338ca; margin-top: 20px; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-size: 14px; }
    th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 6px; font-size: 13px; color: #0f172a; font-family: monospace; }
    pre { background: #0f172a; color: #fde047; padding: 16px; border-radius: 12px; overflow-x: auto; font-family: monospace; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
    @media print {
      body { background: white; padding: 0; }
      .guide-card { box-shadow: none; border: none; padding: 0; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="guide-card">
    <h1>🌟 ChoreQuest: Family Instruction Guide</h1>
    <p><em>The Official Master Handbook for Children & Parents • Raspberry Pi & Home Server</em></p>
    <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 20px 0;">
    
    <h2>👦👧 PART 1: The Kid Mission Handbook (How to Play & Earn)</h2>
    <h3>1. Pick Your Kid Avatar & Profile</h3>
    <p>Tap your name card on the home screen. Personalize your avatar with your favorite emoji and colors. Watch your level progress from Level 1 Novice to Level 5 Champion!</p>
    
    <h3>2. Check Today's Assigned Missions</h3>
    <p>Browse your chores for today. Each chore displays its Star Value (⭐ 1 to 10 points) and estimated focus time.</p>
    
    <h3>3. Mind the Check-Off Time Frames! ⏰</h3>
    <p>Chores are scheduled during specific hours: Morning (6am–11am), Afternoon (12pm–7pm), and Evening (6pm–9:30pm). Outside these hours, tasks are locked so everyone stays on routine.</p>

    <h3>4. Completing Tasks & Celebrating</h3>
    <p>Tap the big green checkmark when you finish! Enjoy the victory chime, confetti burst, and instant star points.</p>

    <h3>5. Use the Focus Stopwatch</h3>
    <p>Tap the stopwatch icon on any chore to start a 5, 10, 15, or 30-minute focus countdown with motivational chimes.</p>

    <h3>6. Can't Complete a Chore? Give a Reason</h3>
    <p>If you're sick, missing supplies, or need help, select "Can't Complete" with a polite reason so parents know.</p>

    <h3>7. Spin the Chore Roulette Wheel</h3>
    <p>Can't decide what task to do first? Let the wheel choose a mission for you!</p>

    <h3>8. Reading Log Adventure & Badges</h3>
    <p>Track book titles and reading minutes. Unlock reading badges and collect stars!</p>

    <h2>🛡️ PART 2: Parent Command & Admin Controls</h2>
    <h3>1. Parent PIN Access</h3>
    <p>Default PIN is <strong>1234</strong>. Change this anytime in Parent Settings.</p>

    <h3>2. Managing Chores & Categories</h3>
    <p>Create, edit, or archive chores. Assign them to all kids or specific siblings, and set custom star payouts.</p>

    <h3>3. Category Check-Off Time Frames</h3>
    <p>In the Parent Dashboard, set allowed completion hours per category (e.g. Morning 6am–11am). Chores cannot be checked off outside these windows without parent override.</p>

    <h3>4. Customizing Star Costs for Snacks & Treats</h3>
    <p>Adjust the required stars for any treat, dessert, or privilege in the Reward Store to fit your household rules.</p>

    <h3>5. Verifying Chores & Activity Logs</h3>
    <p>Review completed chores, view completion timestamps, award bonus stars, and see skipped reasons.</p>

    <h3>6. Kitchen Wall Kiosk Mode</h3>
    <p>Transform an old tablet, iPad, or Raspberry Pi touchscreen into an ambient family scoreboard and chore station.</p>

    <h2>🚀 PART 3: KidCoin Financial System & Rocket Savings</h2>
    <h3>1. What is KidCoin?</h3>
    <p>KidCoin is your family's private digital currency teaching financial literacy, savings goals, and allowance tracking.</p>

    <h3>2. Interactive Rocket Savings Missions</h3>
    <p>Kids set personal savings targets (toys, bicycles, games). An interactive rocket fuels up on their screen as they save, initiating a celebratory blastoff when reached!</p>

    <h3>3. Weekly Compound Interest</h3>
    <p>Teach kids how money grows over time with automated weekly compound interest (e.g. 5% or 10%).</p>

    <h3>4. Allowance & Star Conversion</h3>
    <p>Establish exchange rates (e.g. 10 Stars = $1.00) so kids can trade stars for savings or cash out.</p>

    <h2>🍪 PART 4: Rewards, Snack Requests & Family Goals</h2>
    <h3>1. The Reward Store</h3>
    <p>Trade stars for screen time, allowance, outings, or custom rewards created by parents.</p>

    <h3>2. Kid Snack & Treat Requests</h3>
    <p>Kids browse the snack catalog and send requests to parents. Parents review in the admin queue, verify star balances, and approve with a note.</p>

    <h3>3. Shared Family Goals (Teamwork Meter)</h3>
    <p>Pool stars together for a Family Pizza Night (100 Stars) or Water Park Trip (250 Stars) to foster household cooperation!</p>

    <h3>4. Mind Quest Brain Teasers & Trivia</h3>
    <p>Daily and weekly logic riddles and trivia questions award bonus stars with the Top Brains Leaderboard.</p>

    <h2>🍽️ PART 5: Family Calendar, Meals & Smart Grocery</h2>
    <h3>1. Unified Family Calendar</h3>
    <p>Track sports practices, school events, birthdays, and chores in one place with optional Google Calendar sync.</p>

    <h3>2. Weekly Meal Planner & Recipes</h3>
    <p>Plan breakfasts, lunches, and dinners from Monday to Sunday. Review ingredients, prep times, and cooking instructions.</p>

    <h3>3. Categorized Grocery Shopping List</h3>
    <p>Organized by aisle (Produce, Dairy, Meat, Pantry) for fast shopping trips. Add meal ingredients with one tap.</p>

    <h3>4. Barcode Scanning & Receipt Import</h3>
    <p>Scan retail barcodes directly with your device's camera. Import receipts for automated price tracking.</p>

    <h2>📹 PART 6: Front Door Camera & Kiosk Integration</h2>
    <h3>1. Aqara G400 + go2rtc Streaming</h3>
    <p>Stream live camera video on your local network using go2rtc on Raspberry Pi (:1984) with zero cloud fees.</p>

    <h3>2. iPadOS Kiosk Resilience & MJPEG Fallback</h3>
    <p>Auto-appends <code>&amp;muted=1</code> so iOS Safari allows autoplay. Switch to MJPEG (<code>/api/stream.mjpeg</code>) if WebRTC pauses during sleep.</p>

    <h3>3. Two-Way Voice Broadcast & Chimes</h3>
    <p>Broadcast announcements to kids ("Someone is at the front door! 🚪", "Dinner is ready! 🍽️") with audible chimes.</p>

    <h3>4. Daylight & IR Night Vision Modes</h3>
    <p>Toggle between full-color daylight and infrared night vision. Take live snapshots and download them directly.</p>

    <h2>⏰ PART 7: Recommended Time Window Schedule</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Time Window</th>
          <th>Typical Activities</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>🌅 Morning Missions</td>
          <td>06:00 AM – 11:00 AM</td>
          <td>Make bed, brush teeth, breakfast, school bag</td>
        </tr>
        <tr>
          <td>🏫 After School</td>
          <td>03:00 PM – 06:00 PM</td>
          <td>Homework, lunchbox unpack, pet care</td>
        </tr>
        <tr>
          <td>☀️ Afternoon Tasks</td>
          <td>12:00 PM – 07:00 PM</td>
          <td>Clean room, tidy toys, yard work, trash</td>
        </tr>
        <tr>
          <td>🌙 Evening & Bedtime</td>
          <td>06:00 PM – 09:30 PM</td>
          <td>Dinner dishes, pajamas, reading, lights out</td>
        </tr>
      </tbody>
    </table>

    <h2>🍓 PART 8: Raspberry Pi 5 & Home Wi-Fi Setup</h2>
    <p><strong>1. Local Access:</strong> Connect to home Wi-Fi and open <code>http://raspberrypi.local:3000</code> or your Pi's IP address.</p>
    <p><strong>2. Install as App Icon (PWA):</strong> On iOS Safari tap Share → "Add to Home Screen". On Android Chrome tap 3 dots → "Install App".</p>
    <p><strong>3. 24/7 Autostart Command:</strong></p>
    <pre>npm run build && node dist/server.cjs</pre>
    <p><strong>4. 100% Local Data:</strong> All family data is stored privately on your Raspberry Pi with zero monthly cloud subscriptions.</p>
  </div>
</body>
</html>`;
}
