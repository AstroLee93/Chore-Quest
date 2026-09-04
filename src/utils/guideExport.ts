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
  doc.setFontSize(18);
  doc.text('CHOREQUEST: FAMILY INSTRUCTION GUIDE', margin + 6, y + 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(254, 240, 138); // Yellow 200
  doc.text('Official Illustrated Handbook for Children & Parents • Raspberry Pi & Home Server', margin + 6, y + 18);

  y += 32;

  // Introduction
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Welcome to ChoreQuest!', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const introText = 'ChoreQuest turns daily family responsibilities into an engaging, gamified adventure. Kids earn stars for completing morning, afternoon, and evening missions, while parents maintain complete control over schedules, time frames, chore approvals, and snack or treat rewards—all hosted privately on your home Wi-Fi.';
  const introLines = doc.splitTextToSize(introText, contentWidth);
  doc.text(introLines, margin, y);
  y += introLines.length * 4.5 + 6;

  // SECTION 1: KIDS GUIDE
  checkPageBreak(30);
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PART 1: THE KID MISSION HANDBOOK (How to Play & Earn)', margin + 4, y + 5.5);
  y += 12;

  const kidSteps = [
    {
      num: '1',
      title: 'Pick Your Kid Avatar & Profile',
      desc: 'Tap your name and avatar card on the home screen. You can customize your favorite emoji, colors, and see your current Level (Level 1 Novice to Level 5 Champion) and streak.',
    },
    {
      num: '2',
      title: "Check Today's Assigned Missions",
      desc: 'Browse your daily chore cards. Each task shows its Star Value (⭐ 1 to 10 points), estimated minutes, category icon, and any sub-tasks needed.',
    },
    {
      num: '3',
      title: 'Watch the Check-Off Time Frames!',
      desc: 'Chores have scheduled active hours! Morning tasks (6am-11am), Afternoon tasks (12pm-7pm), and Evening tasks (6pm-9:30pm). Outside these hours, tasks are locked so everyone stays on routine.',
    },
    {
      num: '4',
      title: 'Complete Tasks & Celebrate',
      desc: 'When you finish a chore, tap the big green checkmark! Enjoy the victory chime, confetti burst, and watch your stars count up immediately.',
    },
    {
      num: '5',
      title: 'Use the Built-In Focus Timer',
      desc: 'Need help staying on track? Tap the timer icon on any chore to start a 5, 10, 15, or 30-minute focus countdown with motivational audio cues.',
    },
    {
      num: '6',
      title: 'Can\'t Finish? Give a Reason',
      desc: 'If you are sick, missing cleaning supplies, or have a valid reason, tap "Can\'t Complete" to notify Mom or Dad with a polite explanation.',
    },
    {
      num: '7',
      title: 'Spin the Chore Roulette Wheel',
      desc: 'Can\'t decide what task to do first? Tap "Spin Wheel" to let ChoreQuest randomly select a fun mission for you!',
    },
    {
      num: '8',
      title: 'Redeem Star Rewards & Snack Requests',
      desc: 'Visit the Reward Store! Trade your earned stars for screen time, allowance, outings, or send a custom Snack & Treat Request directly to your parents.',
    },
  ];

  kidSteps.forEach((step) => {
    checkPageBreak(16);
    doc.setFillColor(238, 242, 255); // Indigo 50
    doc.circle(margin + 4, y + 3, 3.5, 'F');
    doc.setTextColor(67, 56, 202); // Indigo 700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(step.num, margin + 2.8, y + 4.2);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(step.title, margin + 11, y + 4);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(step.desc, contentWidth - 12);
    doc.text(lines, margin + 11, y);
    y += lines.length * 4 + 3;
  });

  // SECTION 2: PARENTS COMMAND GUIDE
  checkPageBreak(30);
  y += 4;
  doc.setFillColor(224, 231, 255); // Indigo 100
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
  doc.setTextColor(49, 46, 129); // Indigo 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PART 2: PARENT COMMAND & ADMIN CONTROLS', margin + 4, y + 5.5);
  y += 12;

  const parentSteps = [
    {
      num: '1',
      title: 'Parent PIN Authentication',
      desc: 'Access the Parent Dashboard by entering your Parent PIN (Default: 1234). You can change this anytime under Parent Settings for household privacy.',
    },
    {
      num: '2',
      title: 'Managing Chores & Assignees',
      desc: 'Create, edit, or archive chores. Set custom star payouts (1-20+), assign tasks to all kids or specific individuals, and add step-by-step checklists.',
    },
    {
      num: '3',
      title: 'Category Check-Off Time Frames (New!)',
      desc: 'Enforce timely completion! Set allowed check-off windows per category (e.g., Morning 6:00am-11:00am, Afternoon 12:00pm-7:00pm). Tasks cannot be checked off outside these windows without parent approval.',
    },
    {
      num: '4',
      title: 'Customizing Star Costs for Snacks & Treats',
      desc: 'Under the Rewards tab, configure the exact star cost for each treat, dessert, or extra privilege. Adjust costs anytime to match family rules.',
    },
    {
      num: '5',
      title: 'Verifying Chores & Reviewing Incomplete Reasons',
      desc: 'Review completed chores, view kid-submitted completion notes or optional photos, verify tasks, award bonus stars, and see why any chores were skipped.',
    },
    {
      num: '6',
      title: 'Kitchen Wall Kiosk Mode',
      desc: 'Switch to Kiosk Mode for a high-contrast, ambient display perfect for an old tablet, iPad, or Raspberry Pi touchscreen mounted in the kitchen or hallway.',
    },
  ];

  parentSteps.forEach((step) => {
    checkPageBreak(16);
    doc.setFillColor(254, 226, 226); // Red 100
    doc.circle(margin + 4, y + 3, 3.5, 'F');
    doc.setTextColor(185, 28, 28); // Red 700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(step.num, margin + 2.8, y + 4.2);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(step.title, margin + 11, y + 4);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(step.desc, contentWidth - 12);
    doc.text(lines, margin + 11, y);
    y += lines.length * 4 + 3;
  });

  // SECTION 3: TIME FRAME CHEAT SHEET
  checkPageBreak(30);
  y += 4;
  doc.setFillColor(254, 242, 242); // Rose 50
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
  doc.setTextColor(159, 18, 57); // Rose 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PART 3: RECOMMENDED TIME WINDOW SCHEDULE', margin + 4, y + 5.5);
  y += 12;

  const timeSchedules = [
    { name: '🌅 Morning Missions', hours: '06:00 AM – 11:00 AM', examples: 'Make bed, brush teeth, get dressed, backpack ready' },
    { name: '🏫 After School', hours: '03:00 PM – 06:00 PM', examples: 'Homework, unpack lunchbox, pet feeding, shoes away' },
    { name: '☀️ Afternoon Tasks', hours: '12:00 PM – 07:00 PM', examples: 'Clean room, tidy toys, yard chores, take out trash' },
    { name: '🌙 Evening & Bedtime', hours: '06:00 PM – 09:30 PM', examples: 'Dishes, pajamas on, bath/shower, lights out routine' },
  ];

  timeSchedules.forEach((item) => {
    checkPageBreak(14);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 11, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 11, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(item.name, margin + 3, y + 4.5);

    doc.setTextColor(67, 56, 202);
    doc.text(item.hours, margin + 55, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Examples: ${item.examples}`, margin + 3, y + 8.5);

    y += 13;
  });

  // SECTION 4: RASPBERRY PI 5 & LOCAL HOSTING
  checkPageBreak(30);
  y += 4;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PART 4: RASPBERRY PI 5 & HOME WI-FI SETUP', margin + 4, y + 5.5);
  y += 12;

  const piSteps = [
    '1. Connect your Raspberry Pi 5 to your home router via Wi-Fi or Ethernet cable.',
    '2. Any family device on your Wi-Fi can open: http://raspberrypi.local:3000 or http://<PI-IP>:3000',
    '3. On iOS Safari or Android Chrome, tap "Add to Home Screen" to install it as an app icon.',
    '4. Autostart 24/7 terminal command: npm run build && node dist/server.cjs',
    '5. 100% Private: All logs and profiles stay stored inside your home network.',
  ];

  piSteps.forEach((step) => {
    checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(step, margin + 2, y);
    y += 5.5;
  });

  // Page Numbers Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`ChoreQuest Family Instruction Guide • Page ${i} of ${totalPages}`, margin, pageHeight - 8);
    doc.text('https://chorequest.local', pageWidth - margin - 30, pageHeight - 8);
  }

  doc.save('ChoreQuest-Family-Instruction-Guide.pdf');
}

export function generateGuideMarkdown(): string {
  return `# 🌟 ChoreQuest: Family Instruction Guide
*The Official Illustrated Handbook for Children & Parents • Raspberry Pi & Home Server*

---

## 📖 Welcome to ChoreQuest!
ChoreQuest turns daily household responsibilities into an engaging, gamified adventure. Kids earn stars for completing morning, afternoon, and evening missions, while parents maintain complete control over schedules, time frames, chore approvals, and snack or treat rewards—all hosted privately on your home Wi-Fi.

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
- **☀️ Afternoon Tasks (12:00 PM – 07:00 PM)**: Homework, clean room, unpack lunchbox, pet care.
- **🌙 Evening Tasks (06:00 PM – 09:30 PM)**: Dishes, tidy living room, pajamas, bedtime reading.
- *Notice:* Chores are locked outside of these scheduled hours to keep our family on a healthy routine!

### 4. Completing Tasks & Earning Stars
- Tap the **Complete** button when you finish your mission.
- Listen for the victory chime, watch the confetti burst, and your stars will be awarded immediately!

### 5. Using the Focus Timer ⏱️
- Tap the timer icon on any chore to start a 5, 10, 15, or 30-minute focus countdown.
- Work until the chime sounds to beat the clock!

### 6. Can't Complete a Chore? Give a Reason
- If you are sick, supplies are empty, or you need parent help, tap "Can't Complete".
- Choose a reason so parents understand why the task was skipped.

### 7. Spin the Chore Roulette Wheel 🎡
- Can't decide what chore to tackle first? Tap "Spin Wheel" to let ChoreQuest choose for you!

### 8. The Reward Store & Snack Requests 🍪
- Trade your hard-earned stars for rewards: screen time, extra allowance, fun outings, or special toys.
- Use the **Snack Request** feature to ask Mom & Dad for your favorite treat!

---

## 🛡️ PART 2: PARENT COMMAND & ADMIN CONTROLS

### 1. Parent PIN Access
- Default Parent PIN: \`1234\`.
- Change this anytime in Parent Settings to keep admin settings private.

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

### 5. Verifying Chores & Photo Proof
- Review today's completed chores in the Activity Log.
- Verify completions, award bonus stars, and see why any chores were skipped.

### 6. Kitchen Wall Kiosk Mode
- Tap Kiosk Mode in the navigation menu.
- Perfect for an old iPad, Android tablet, or Raspberry Pi touchscreen mounted on the kitchen wall!

---

## ⏰ PART 3: RECOMMENDED TIME WINDOW SCHEDULE

| Category | Time Window | Typical Activities |
|---|---|---|
| 🌅 Morning Missions | 06:00 AM – 11:00 AM | Make bed, teeth, breakfast, backpack |
| 🏫 After School | 03:00 PM – 06:00 PM | Homework, lunchbox unpack, pet feeding |
| ☀️ Afternoon Tasks | 12:00 PM – 07:00 PM | Room cleanup, toys, yard work, trash |
| 🌙 Evening & Bedtime | 06:00 PM – 09:30 PM | Dinner dishes, pajamas, reading, bedtime |

---

## 🍓 PART 4: RASPBERRY PI 5 & HOME WI-FI SETUP

1. **Local Access URLs:**
   - \`http://raspberrypi.local:3000\`
   - \`http://<PI-IP>:3000\` (run \`hostname -I\` to find IP)
2. **Add to Mobile Home Screen (PWA):**
   - iOS Safari: Tap Share → "Add to Home Screen"
   - Android Chrome: Tap 3-dots → "Install App" or "Add to Home Screen"
3. **24/7 Autostart Command:**
   \`\`\`bash
   npm run build && node dist/server.cjs
   \`\`\`
4. **100% Local Privacy:**
   - All logs, kid profiles, and star points stay completely inside your home network.
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
  const markdown = generateGuideMarkdown();
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
      max-width: 860px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f8fafc;
    }
    .guide-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 36px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    h1 { color: #312e81; font-size: 28px; margin-bottom: 8px; }
    h2 { color: #1e1b4b; border-bottom: 2px solid #fde047; padding-bottom: 8px; margin-top: 32px; font-size: 20px; }
    h3 { color: #4338ca; margin-top: 20px; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-size: 14px; }
    th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 6px; font-size: 13px; color: #0f172a; }
    pre { background: #0f172a; color: #fde047; padding: 16px; border-radius: 12px; overflow-x: auto; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
    @media print {
      body { background: white; padding: 0; }
      .guide-card { box-shadow: none; border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="guide-card">
    <h1>🌟 ChoreQuest: Family Instruction Guide</h1>
    <p><em>The Official Illustrated Handbook for Children & Parents • Raspberry Pi & Home Server</em></p>
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

    <h3>5. Use the Focus Timer</h3>
    <p>Tap the timer icon on any chore to start a 5, 10, 15, or 30-minute focus countdown with motivational chimes.</p>

    <h3>6. Can't Complete a Chore? Give a Reason</h3>
    <p>If you're sick, missing supplies, or need help, select "Can't Complete" with a polite reason so parents know.</p>

    <h3>7. Spin the Chore Roulette Wheel</h3>
    <p>Can't decide what task to do first? Let the wheel choose a mission for you!</p>

    <h3>8. Reward Store & Snack Requests</h3>
    <p>Trade stars for screen time, allowance, outings, or send a Snack Request to Mom & Dad!</p>

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

    <h2>⏰ PART 3: Recommended Time Window Schedule</h2>
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

    <h2>🍓 PART 4: Raspberry Pi 5 & Home Wi-Fi Setup</h2>
    <p><strong>1. Local Access:</strong> Connect to home Wi-Fi and open <code>http://raspberrypi.local:3000</code> or your Pi's IP address.</p>
    <p><strong>2. Install as App Icon (PWA):</strong> On iOS Safari tap Share → "Add to Home Screen". On Android Chrome tap 3 dots → "Install App".</p>
    <p><strong>3. 24/7 Autostart Command:</strong></p>
    <pre>npm run build && node dist/server.cjs</pre>
    <p><strong>4. 100% Local Data:</strong> All family data is stored privately on your Raspberry Pi with zero monthly cloud subscriptions.</p>
  </div>
</body>
</html>`;
}
