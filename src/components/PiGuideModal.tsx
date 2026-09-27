import React, { useState } from 'react';
import {
  Server,
  Wifi,
  Smartphone,
  Terminal,
  Shield,
  Copy,
  Check,
  Printer,
  Download,
  FileText,
  Clock,
  Sparkles,
  Star,
  Timer,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  RotateCw,
  Gift,
  BookOpen,
  Sun,
  Moon,
  Cookie,
  Tv,
  Coins,
  Rocket,
  TrendingUp,
  Utensils,
  ShoppingCart,
  Calendar as CalendarIcon,
  Video,
  Award,
  Brain,
  Camera,
  Heart,
  DollarSign,
  Scan,
} from 'lucide-react';
import { sound } from '../utils/sound';
import {
  generateGuidePDF,
  generateGuideHTML,
  generateGuideMarkdown,
  downloadFile,
} from '../utils/guideExport';

interface PiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type GuideTab =
  | 'kids'
  | 'parents'
  | 'kidcoin'
  | 'rewards'
  | 'calendar'
  | 'camera'
  | 'routine'
  | 'pi'
  | 'all';

export const PiGuideModal: React.FC<PiGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('kids');
  const [copied, setCopied] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    sound.playTap();
    setTimeout(() => setCopied(null), 2500);
  };

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  const handleDownloadPDF = () => {
    sound.playTap();
    setIsExporting(true);
    try {
      generateGuidePDF();
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const handleDownloadHTML = () => {
    sound.playTap();
    downloadFile(generateGuideHTML(), 'ChoreQuest-Family-Instruction-Guide.html', 'text/html');
  };

  const handleDownloadMarkdown = () => {
    sound.playTap();
    downloadFile(generateGuideMarkdown(), 'ChoreQuest-Family-Instruction-Guide.md', 'text/markdown');
  };

  const handleCopyFullGuide = () => {
    copyToClipboard(generateGuideMarkdown(), 'full-guide');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
      <div
        id="pi-guide-dialog"
        className="bg-yellow-50 w-full max-w-5xl rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-7 shadow-2xl border-2 sm:border-4 border-yellow-300 max-h-[95vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 sm:pb-4 border-b-2 border-yellow-200 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-md shrink-0">
              📖
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-black text-indigo-950 italic tracking-tight truncate">
                  ChoreQuest Family Instruction Guide
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-300 text-yellow-900 border border-yellow-400 shrink-0">
                  Complete 2026 Master Edition
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-bold truncate">
                Illustrated handbook for kids & parents • Chores, KidCoin, Front Door Camera, Meal Planner & Pi Server
              </p>
            </div>
          </div>
          <button
            id="btn-close-pi-guide"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2 sm:p-2.5 rounded-2xl text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border-2 border-slate-200 transition-colors cursor-pointer shrink-0"
            aria-label="Close Guide"
          >
            ✕
          </button>
        </div>

        {/* Quick Export Toolbar */}
        <div className="no-print bg-white p-2 sm:p-2.5 rounded-2xl border border-yellow-200 shadow-2xs mt-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export & Print for the Family Fridge:</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
              title="Download formatted PDF document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Print directly or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-700" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleDownloadHTML}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Export standalone offline HTML document"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>HTML</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Export Markdown text file"
            >
              <span>.MD</span>
            </button>

            <button
              onClick={handleCopyFullGuide}
              className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              title="Copy complete guide text"
            >
              {copied === 'full-guide' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'full-guide' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="no-print flex items-center gap-1.5 sm:gap-2 mt-3 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('kids');
            }}
            className={`px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'kids'
                ? 'bg-amber-400 text-slate-900 shadow-xs border-2 border-yellow-500 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-yellow-100'
            }`}
          >
            <span>👦👧</span>
            <span>Kid's Handbook</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('parents');
            }}
            className={`px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'parents'
                ? 'bg-indigo-900 text-white shadow-xs border-2 border-indigo-950 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Parent's Command</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('kidcoin');
            }}
            className={`px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'kidcoin'
                ? 'bg-emerald-600 text-white shadow-xs border-2 border-emerald-700 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>KidCoin & Savings</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('rewards');
            }}
            className={`px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-pink-500 text-white shadow-xs border-2 border-pink-600 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-pink-50'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Rewards & Goals</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('calendar');
            }}
            className={`px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-cyan-600 text-white shadow-xs border-2 border-cyan-700 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-cyan-50'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Meals, Grocery & Calendar</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('camera');
            }}
            className={`px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-violet-600 text-white shadow-xs border-2 border-violet-700 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-violet-50'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Front Door Camera & Kiosk</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('routine');
            }}
            className={`px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'routine'
                ? 'bg-amber-600 text-white shadow-xs border-2 border-amber-700 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Routines & Hours</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('pi');
            }}
            className={`px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'pi'
                ? 'bg-rose-600 text-white shadow-xs border-2 border-rose-700 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50'
            }`}
          >
            <span>🍓</span>
            <span>Raspberry Pi 5</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('all');
            }}
            className={`px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-xs border-2 border-slate-900 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Full Complete Guide</span>
          </button>
        </div>

        {/* Scrollable Guide Content */}
        <div
          id="printable-guide"
          className="flex-1 overflow-y-auto mt-3 pr-1 sm:pr-2 space-y-4 text-slate-700 text-xs sm:text-sm"
        >
          {/* TAB 1: KIDS HANDBOOK */}
          {(activeTab === 'kids' || activeTab === 'all') && (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-100/70 border-2 border-amber-300">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">⭐</span>
                  <h3 className="text-base sm:text-lg font-black text-amber-950">
                    Part 1: The Kid Mission Handbook (How to Play & Earn)
                  </h3>
                </div>
                <p className="text-xs text-amber-900 font-bold">
                  Welcome aboard, Hero! Complete your daily missions, check off your chores, beat the focus timer, and earn stars for awesome snacks and rewards!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center">
                        1
                      </span>
                      <h4 className="font-black text-slate-800 text-sm">Choose Your Avatar & Profile</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      Tap your name card on the home screen. Pick your favorite emoji avatar, custom color, and see your current Level (Level 1 Novice all the way to Level 5 Chore Champion) and daily flame streak!
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] font-black text-amber-800">
                    <span>💡 Tip: Complete at least 1 chore daily to grow your flame streak!</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center">
                        2
                      </span>
                      <h4 className="font-black text-slate-800 text-sm">Check Today's Assigned Missions</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      Browse your chores for today. Each chore displays its Star Reward (⭐ 1 to 10 points) and estimated focus time. If a chore has sub-tasks, tap each step as you complete it!
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] font-black text-indigo-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>Harder tasks award bounty bonus stars!</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center">
                        3
                      </span>
                      <h4 className="font-black text-slate-800 text-sm">Watch the Check-Off Time Frames! ⏰</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      Chores must be checked off during their active hours! Morning tasks can only be checked off between 6:00 AM – 11:00 AM, Afternoon tasks between 12:00 PM – 7:00 PM, and Evening tasks between 6:00 PM – 9:30 PM.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-amber-100 flex items-center gap-2 text-[11px] font-black text-amber-900 bg-amber-50 px-2 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>If locked outside hours, it opens again at its scheduled time!</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center">
                        4
                      </span>
                      <h4 className="font-black text-slate-800 text-sm">Complete & Celebrate! 🎉</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      When your chore is finished, press the big green checkmark! Hear the victory chime, watch the confetti burst, and watch your star score increase right away.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] font-black text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed chores stay checked off for the rest of today.</span>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center">
                        5
                      </span>
                      <h4 className="font-black text-slate-800 text-sm">Use the Focus Countdown Timer ⏱️</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      Need help staying focused? Tap the stopwatch icon on any chore to start a 5, 10, 15, or 30-minute focus timer. Race against the clock with motivational chimes!
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] font-black text-sky-800">
                    <Timer className="w-3.5 h-3.5 text-sky-600" />
                    <span>Helps you get tasks done fast so you have more free time!</span>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-xl bg-purple-500 text-white font-black text-sm flex items-center justify-center">
                        6
                      </span>
                      <h4 className="font-black text-slate-800 text-sm">Spin the Chore Roulette Wheel 🎡</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      Can't decide which chore to start with? Tap the "Spin Wheel" button in your dashboard. Watch the wheel spin and let ChoreQuest pick your next mission!
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] font-black text-purple-800">
                    <RotateCw className="w-3.5 h-3.5 text-purple-600" />
                    <span>Turns chore selection into a fun mini-game.</span>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-xl bg-rose-500 text-white font-black text-sm flex items-center justify-center">
                        7
                      </span>
                      <h4 className="font-black text-slate-800 text-sm">Can't Finish? Give a Reason</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      If you're sick, out of cleaning supplies, or need adult help, tap the "Can't Complete" button. Select a polite explanation so parents understand why the chore was skipped!
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] font-black text-rose-800">
                    <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Honesty is always appreciated by parents!</span>
                  </div>
                </div>

                {/* Step 8 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-xl bg-indigo-500 text-white font-black text-sm flex items-center justify-center">
                        8
                      </span>
                      <h4 className="font-black text-slate-800 text-sm">Reading Log Adventure & Badges 📚</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      Log your daily reading minutes and book titles! Track total reading time, level up your Reading Streak, and unlock special achievement badges (Bookworm, Speed Reader, and Master Scholar).
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] font-black text-indigo-800">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Collect all achievement badges across the board!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARENTS COMMAND GUIDE */}
          {(activeTab === 'parents' || activeTab === 'all') && (
            <div className={`space-y-3 sm:space-y-4 ${activeTab === 'all' ? 'pt-6 border-t-2 border-indigo-200 print-page-break' : ''}`}>
              <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-indigo-100/80 border-2 border-indigo-300">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-6 h-6 text-indigo-900" />
                  <h3 className="text-base sm:text-lg font-black text-indigo-950">
                    Part 2: Parent Command & Admin Guide
                  </h3>
                </div>
                <p className="text-xs text-indigo-900 font-bold">
                  Maintain full authority over schedules, time restrictions, chore approvals, and star values. Built for fast household management.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Parent Step 1 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-xl bg-indigo-900 text-white font-black text-sm flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-black text-slate-800 text-sm">Parent PIN Access</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Open the navigation menu and enter your 4-digit Parent PIN. The default PIN is <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-indigo-900 font-black">1234</code>. You can change this anytime under Parent Settings for complete household privacy.
                  </p>
                </div>

                {/* Parent Step 2 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-xl bg-indigo-900 text-white font-black text-sm flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-black text-slate-800 text-sm">Managing Chores & Assignees</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Create chores with custom star payouts (1–20+ points), assign them to all kids or specific individuals, set daily or weekly frequencies, and add step-by-step subtask checklists.
                  </p>
                </div>

                {/* Parent Step 3 - TIME FRAMES */}
                <div className="p-4 rounded-2xl bg-white border-2 border-indigo-400 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center">
                      3
                    </span>
                    <h4 className="font-black text-slate-800 text-sm">Category Check-Off Time Frames</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    In the <strong>Chores & Categories</strong> tab, configure allowed completion hours per category (e.g. Morning 6am–11am, Afternoon 12pm–7pm). Outside these hours, check-off is locked on kid devices!
                  </p>
                  <div className="mt-2 text-[11px] font-bold text-indigo-900 bg-indigo-50 p-2 rounded-xl">
                    ⚡ Use one-click presets: Morning, Afternoon, Evening, or After-School.
                  </div>
                </div>

                {/* Parent Step 4 - STAR COSTS */}
                <div className="p-4 rounded-2xl bg-white border-2 border-indigo-400 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-xl bg-pink-500 text-white font-black text-sm flex items-center justify-center">
                      4
                    </span>
                    <h4 className="font-black text-slate-800 text-sm">Editing Star Costs for Snacks & Treats</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Under the <strong>Rewards & Treats</strong> tab, you can edit the required amount of stars for any snack or privilege. If a treat is worth 15 stars instead of 10, simply adjust it to fit your household economy!
                  </p>
                  <div className="mt-2 text-[11px] font-bold text-pink-900 bg-pink-50 p-2 rounded-xl">
                    🍪 Review kid snack requests and approve them with one tap.
                  </div>
                </div>

                {/* Parent Step 5 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-xl bg-indigo-900 text-white font-black text-sm flex items-center justify-center">
                      5
                    </span>
                    <h4 className="font-black text-slate-800 text-sm">Verifying Chores & Activity Logs</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    In the Activity Log tab, review completed chores, view completion timestamps, grant bonus stars for exceptional work, and see why any chores were skipped.
                  </p>
                </div>

                {/* Parent Step 6 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-xl bg-indigo-900 text-white font-black text-sm flex items-center justify-center">
                      6
                    </span>
                    <h4 className="font-black text-slate-800 text-sm">Kitchen Wall Kiosk Mode 📺</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Mount an old iPad, Android tablet, or touch monitor in the kitchen. Launch Kiosk Mode for a high-contrast, always-on household scoreboard with MVP leaderboards, digital clock, and front door camera button.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KIDCOIN & SAVINGS MISSIONS */}
          {(activeTab === 'kidcoin' || activeTab === 'all') && (
            <div className={`space-y-3 sm:space-y-4 ${activeTab === 'all' ? 'pt-6 border-t-2 border-emerald-200 print-page-break' : ''}`}>
              <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-emerald-100/80 border-2 border-emerald-300">
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="w-6 h-6 text-emerald-900" />
                  <h3 className="text-base sm:text-lg font-black text-emerald-950">
                    Part 3: KidCoin Financial System & Rocket Savings Missions
                  </h3>
                </div>
                <p className="text-xs text-emerald-900 font-bold">
                  Teach lifelong financial literacy, real-dollar savings goals, compound interest calculations, and allowance conversions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                      🪙
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">What is KidCoin?</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    KidCoin is your family's private digital currency that bridges chore stars and real-world allowance. Kids track their total balance, see deposits from completed chore missions, and learn how money is managed.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border-2 border-emerald-400 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                      🚀
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Interactive Rocket Savings Missions</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Kids can set a savings target (like a new Lego set, bicycle, or video game). As they save KidCoins towards their mission, an interactive rocket fuels up on their screen and initiates a launch celebration when the goal is reached!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                      📈
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Compound Interest Earnings</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Teach kids the magic of compounding! Parents can enable weekly compound interest (e.g. 5% or 10%). The app calculates weekly growth, showing children how patience and saving money generates extra passive income.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                      💳
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Allowance & Star Conversion</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Parents can establish the exchange rate between earned chore stars and real money (e.g., 10 Stars = $1.00). Kids can choose whether to cash out for immediate treats or deposit into their long-term KidCoin savings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REWARDS, SNACK REQUESTS & FAMILY GOALS */}
          {(activeTab === 'rewards' || activeTab === 'all') && (
            <div className={`space-y-3 sm:space-y-4 ${activeTab === 'all' ? 'pt-6 border-t-2 border-pink-200 print-page-break' : ''}`}>
              <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-pink-100/80 border-2 border-pink-300">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-6 h-6 text-pink-900" />
                  <h3 className="text-base sm:text-lg font-black text-pink-950">
                    Part 4: Rewards, Snack Requests, Family Goals & Mind Quests
                  </h3>
                </div>
                <p className="text-xs text-pink-900 font-bold">
                  Keep motivation high with immediate incentives, collaborative household goals, and daily brain teaser trivia challenges.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black">
                      🎁
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">The Reward Store</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Trade stars for privileges: 30 minutes of video games, choosing dinner, staying up 30 minutes late on Friday, or special weekend outings. Parents can add custom rewards anytime.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black">
                      🍪
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Kid Snack & Treat Requests</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Kids can browse the snack catalog and submit a request to Mom or Lex. Parents review the request in the admin queue, verify the kid's star balance, and approve or decline with a personalized note.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border-2 border-pink-300 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                      🏆
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Shared Family Goals (Teamwork Meter)</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Encourage siblings to work together! Set a collective household goal like a Family Pizza Party (100 Stars) or Water Park Trip (250 Stars). All kids' completed chores contribute to a shared progress bar!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                      🧠
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Mind Quest Brain Teasers & Trivia</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Engage young minds with age-tailored daily trivia, logic puzzles, and math challenges. Kids earn bonus stars for solving riddles, and the Top Brains Leaderboard spotlights the week's sharpest thinkers!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MEALS, GROCERY & CALENDAR */}
          {(activeTab === 'calendar' || activeTab === 'all') && (
            <div className={`space-y-3 sm:space-y-4 ${activeTab === 'all' ? 'pt-6 border-t-2 border-cyan-200 print-page-break' : ''}`}>
              <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-cyan-100/80 border-2 border-cyan-300">
                <div className="flex items-center gap-2 mb-1">
                  <Utensils className="w-6 h-6 text-cyan-900" />
                  <h3 className="text-base sm:text-lg font-black text-cyan-950">
                    Part 5: Family Calendar, Meal Planner & Smart Grocery Management
                  </h3>
                </div>
                <p className="text-xs text-cyan-900 font-bold">
                  Streamline household logistics, plan nutritious weekly menus, and automate grocery shopping with barcode scanning.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black">
                      📅
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Unified Family Calendar</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    View daily and monthly schedules, doctor appointments, soccer practices, school holidays, and chore deadlines in one place. Supports optional two-way Google Calendar synchronization!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black">
                      🍳
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Weekly Meal Planner & Recipe Explorer</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Plan breakfasts, lunches, and dinners from Monday through Sunday. Open recipe cards to review ingredients, prep times, step-by-step instructions, and kids' favorite meals.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black">
                      🛒
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Categorized Grocery Shopping List</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Missing pantry items? Add groceries categorized by aisle (Produce, Dairy, Meat, Bakery, Pantry). Ingredients from your planned weekly meals can be added with a single tap.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border-2 border-cyan-400 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black">
                      🔍
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Barcode Scanning & Receipt Import</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Scan retail barcodes directly using your device's camera to look up products instantly. Use Receipt Import to scan store receipts for automatic price estimates and pantry check-offs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FRONT DOOR CAMERA & KIOSK */}
          {(activeTab === 'camera' || activeTab === 'all') && (
            <div className={`space-y-3 sm:space-y-4 ${activeTab === 'all' ? 'pt-6 border-t-2 border-violet-200 print-page-break' : ''}`}>
              <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-violet-100/80 border-2 border-violet-300">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-6 h-6 text-violet-900" />
                  <h3 className="text-base sm:text-lg font-black text-violet-950">
                    Part 6: Front Door Camera & Kitchen Wall Kiosk Integration
                  </h3>
                </div>
                <p className="text-xs text-violet-900 font-bold">
                  Stream live security camera feeds from go2rtc on your Raspberry Pi directly to your iPad kiosk and family devices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center font-black">
                      📹
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Aqara G400 + go2rtc Streaming</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    ChoreQuest connects to your local <strong>go2rtc</strong> server running on port 1984. Enter your stream URL (e.g. <code className="bg-slate-100 text-violet-900 px-1 py-0.5 rounded font-mono text-[11px]">http://192.168.50.X:1984/stream.html?src=aqara&amp;mode=webrtc&amp;muted=1</code>) to view the live porch feed without cloud fees.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border-2 border-violet-400 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black">
                      🛡️
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">iPadOS Kiosk Resilience & MJPEG Fallback</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Designed specifically for wall-mounted iPads: automatically adds <code className="font-mono text-emerald-700 bg-emerald-50 px-1 rounded">&amp;muted=1</code> so Safari allows autoplay. If a WebRTC socket pauses when the iPad sleeps, tap the HUD button to switch to MJPEG streaming (<code className="font-mono text-[11px]">/api/stream.mjpeg</code>) for 100% uninterrupted display.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center font-black">
                      📢
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Two-Way Chime Broadcast & Audio</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Broadcast quick voice alerts to the kids ("Someone is at the front door! 🚪", "Dinner is ready! 🍽️", "10 minute warning before bedtime! 🛏️") with audio chimes and visual banners.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center font-black">
                      🌙
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">Daylight & IR Night Vision Modes</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Toggle between crisp full-color Daylight mode and high-contrast Infrared Night Vision directly from the camera modal header. Take instant snapshots and download them with one tap.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DAILY ROUTINES & TIME WINDOWS */}
          {(activeTab === 'routine' || activeTab === 'all') && (
            <div className={`space-y-3 sm:space-y-4 ${activeTab === 'all' ? 'pt-6 border-t-2 border-amber-200 print-page-break' : ''}`}>
              <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-100/80 border-2 border-amber-300">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-6 h-6 text-amber-900" />
                  <h3 className="text-base sm:text-lg font-black text-amber-950">
                    Part 7: Recommended Family Time Windows & Routine
                  </h3>
                </div>
                <p className="text-xs text-amber-900 font-bold">
                  Time-gating ensures chores happen at natural parts of the day so kids develop reliable, consistent habits.
                </p>
              </div>

              {/* Visual Routine Schedule Cards */}
              <div className="space-y-2.5">
                {/* Morning */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xl shrink-0">
                      🌅
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm">Morning Tasks</h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          06:00 AM – 11:00 AM
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold mt-0.5">
                        Typical tasks: Make bed, brush teeth, get dressed, eat breakfast, pack backpack & water bottle.
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] font-black text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl shrink-0 text-center">
                    ☀️ Starts the day right
                  </div>
                </div>

                {/* After School */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-purple-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-black text-xl shrink-0">
                      🏫
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm">After School Chores</h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300">
                          03:00 PM – 06:00 PM
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold mt-0.5">
                        Typical tasks: Unpack lunchbox, complete homework, put away shoes & coat, feed family pets.
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] font-black text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl shrink-0 text-center">
                    🎒 Before free time
                  </div>
                </div>

                {/* Afternoon */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-sky-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center font-black text-xl shrink-0">
                      ☀️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm">Afternoon & Yard Work</h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-sky-100 text-sky-900 border border-sky-300">
                          12:00 PM – 07:00 PM
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold mt-0.5">
                        Typical tasks: Tidy toy area, empty trash cans, sweep patio, vacuum living room, clean bedroom.
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] font-black text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl shrink-0 text-center">
                    🧹 Weekend & midday
                  </div>
                </div>

                {/* Evening */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-indigo-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-black text-xl shrink-0">
                      🌙
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm">Evening & Bedtime</h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
                          06:00 PM – 09:30 PM
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold mt-0.5">
                        Typical tasks: Clear dinner table, load dishwasher, put on pajamas, 20 min reading, lights out.
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] font-black text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl shrink-0 text-center">
                    🛏️ Calming night routine
                  </div>
                </div>
              </div>

              {/* Time Window Rules Callout */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 space-y-1">
                <div className="font-black text-slate-900 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>What happens when a task is locked?</span>
                </div>
                <p>• The task card displays a locked badge with the opening time (e.g. <code>🔒 Opens at 6:00 AM</code>).</p>
                <p>• Kids cannot accidentally or prematurely check off chores when it's not the right time of day.</p>
                <p>• Parents can still override or verify completions anytime directly from the Parent Admin Activity Log.</p>
              </div>
            </div>
          )}

          {/* TAB 8: RASPBERRY PI 5 SETUP */}
          {(activeTab === 'pi' || activeTab === 'all') && (
            <div className={`space-y-3 sm:space-y-4 ${activeTab === 'all' ? 'pt-6 border-t-2 border-rose-200 print-page-break' : ''}`}>
              <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-rose-100/80 border-2 border-rose-300">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🍓</span>
                  <h3 className="text-base sm:text-lg font-black text-rose-950">
                    Part 8: Raspberry Pi 5 Setup & Home Wi-Fi Hosting
                  </h3>
                </div>
                <p className="text-xs text-rose-900 font-bold">
                  Host ChoreQuest 100% locally on your home network with zero monthly cloud subscriptions.
                </p>
              </div>

              {/* Section 1: Local Access URLs */}
              <div className="p-4 rounded-3xl bg-white border-2 border-yellow-400 shadow-2xs">
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-2 text-sm">
                  <Wifi className="w-4 h-4 text-indigo-600" />
                  1. Accessing from Family Phones & Tablets
                </h3>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  Once running on your Raspberry Pi 5, any phone, iPad, or computer connected to your home Wi-Fi can open the app in their browser using:
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 bg-yellow-50 p-2.5 rounded-2xl border border-yellow-200 flex items-center justify-between font-mono text-xs text-slate-800">
                    <span className="font-bold">http://raspberrypi.local:3000</span>
                    <button
                      onClick={() => copyToClipboard('http://raspberrypi.local:3000', 'url1')}
                      className="text-indigo-600 hover:text-indigo-800 font-sans text-xs font-black flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-xl border border-indigo-200 shadow-2xs"
                    >
                      {copied === 'url1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied === 'url1' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="flex-1 bg-yellow-50 p-2.5 rounded-2xl border border-yellow-200 flex items-center justify-between font-mono text-xs text-slate-800">
                    <span className="font-bold">http://&lt;PI-IP&gt;:3000</span>
                    <button
                      onClick={() => copyToClipboard('hostname -I', 'cmd1')}
                      className="text-indigo-600 hover:text-indigo-800 font-sans text-xs font-black flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-xl border border-indigo-200 shadow-2xs"
                    >
                      {copied === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Find IP</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Mobile Add to Home Screen */}
              <div className="p-4 rounded-3xl bg-white border-2 border-pink-400 shadow-2xs">
                <h3 className="font-black text-pink-900 flex items-center gap-2 mb-2 text-sm">
                  <Smartphone className="w-4 h-4 text-pink-600" />
                  2. Add as an App Icon on Kid & Parent Phones (PWA)
                </h3>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5 font-bold">
                  <li>
                    <strong>On iPhone / iPad (Safari):</strong> Tap the <em>Share button</em> (square with arrow) → Tap <em>"Add to Home Screen"</em>.
                  </li>
                  <li>
                    <strong>On Android (Chrome):</strong> Tap the <em>3-dots menu</em> at top right → Tap <em>"Add to Home Screen"</em> or <em>"Install App"</em>.
                  </li>
                  <li>
                    Launches full-screen with native touch responsiveness and offline caching.
                  </li>
                </ul>
              </div>

              {/* Section 3: 24/7 Autostart */}
              <div className="p-4 rounded-3xl bg-white border-2 border-indigo-400 shadow-2xs">
                <h3 className="font-black text-indigo-900 flex items-center gap-2 mb-2 text-sm">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  3. Keeping It Running 24/7 on Pi OS
                </h3>
                <p className="text-xs text-slate-600 font-bold mb-2">
                  Execute this command in your Raspberry Pi terminal to launch the bundled production server:
                </p>
                <div className="bg-slate-900 text-yellow-300 p-3 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner flex items-center justify-between gap-2">
                  <code>npm run build &amp;&amp; node dist/server.cjs</code>
                  <button
                    onClick={() => copyToClipboard('npm run build && node dist/server.cjs', 'cmd2')}
                    className="text-yellow-400 hover:text-white font-sans text-xs font-black flex items-center gap-1 cursor-pointer bg-slate-800 px-2 py-1 rounded-lg shrink-0"
                  >
                    {copied === 'cmd2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'cmd2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Section 4: Data Privacy Guarantee */}
              <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-300 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-emerald-900 text-xs sm:text-sm">
                    100% Local Data Privacy & Security
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed font-bold">
                    All chore logs, kid profiles, KidCoin balances, meal plans, and camera streams reside strictly inside your home network. Zero external tracking or subscription lock-in!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="no-print pt-3 mt-3 border-t-2 border-yellow-200 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] font-bold text-slate-500 hidden sm:block">
            Tip: You can export this guide as a PDF or print it out to stick on your fridge!
          </div>
          <button
            id="btn-close-pi-guide-bottom"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-95 ml-auto"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
