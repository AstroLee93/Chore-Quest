import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  BookOpen,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  History,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Flame,
  ChevronRight,
  Bookmark,
  Heart,
  Smile,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { KidProfile, FamilyDatabase, ReadingLogEntry, KidBookShelfItem } from '../types';
import { fireConfetti } from '../utils/confetti';
import { sound } from '../utils/sound';
import { getTodayDateString } from '../utils/storage';
import {
  findDuplicateChapterLog,
  formatReadingTimestamp,
  getKidReadingStats,
  findReadingChore,
  getReadingRewardStars,
  getReadingDailyClaimLimit,
  getReadingClaimsCountForDate,
  normalizeBookTitle,
  normalizeChapter,
  STARTER_BOOK_IDEAS,
} from '../utils/reading';

interface ReadingLogModalProps {
  isOpen: boolean;
  kid: KidProfile | null;
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  onClose: () => void;
  onPostComplete?: () => void;
  embedded?: boolean;
}

const REACTION_OPTIONS = [
  { emoji: '🤯', label: 'Epic Cliffhanger!', id: 'cliffhanger' },
  { emoji: '🚀', label: "Couldn't Put It Down!", id: 'exciting' },
  { emoji: '😄', label: 'Super Fun & Funny', id: 'funny' },
  { emoji: '🧠', label: 'Learned Something Cool', id: 'learned' },
  { emoji: '🧙‍♂️', label: 'Magical Adventure', id: 'magical' },
  { emoji: '💖', label: 'Loved Every Page', id: 'loved' },
];

const EMOJI_COVERS = ['📖', '🐉', '🚀', '🧙‍♂️', '⚡', '🐾', '👑', '🦕', '🕵️', '🌊', '🏰', '🛸'];

export const ReadingLogModal: React.FC<ReadingLogModalProps> = ({
  isOpen,
  kid,
  database,
  onUpdateDatabase,
  onClose,
  onPostComplete,
  embedded = false,
}) => {
  if (!isOpen || !kid) return null;

  const todayStr = getTodayDateString();
  const readingChore = findReadingChore(database.chores || []);
  const rewardStars = getReadingRewardStars(database);
  const dailyClaimLimit = getReadingDailyClaimLimit(database.settings);

  // Kid's reading shelf and existing logs
  const allLogs = database.readingLogs || [];
  const kidShelf = kid.readingShelf || [];
  const stats = useMemo(() => getKidReadingStats(allLogs, kidShelf, kid.id, todayStr), [allLogs, kidShelf, kid.id, todayStr]);

  // Number of times stars have been claimed today
  const claimsToday = useMemo(
    () => getReadingClaimsCountForDate(allLogs, kid.id, todayStr),
    [allLogs, kid.id, todayStr]
  );
  const isLimitReached = dailyClaimLimit > 0 && claimsToday >= dailyClaimLimit;

  // Active sub-view: 'log' | 'shelf' | 'timer' | 'journal'
  const [activeTab, setActiveTab] = useState<'log' | 'timer' | 'journal'>('log');

  // Form State
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [bookTitle, setBookTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [coverEmoji, setCoverEmoji] = useState<string>('📖');
  const [chapterCompleted, setChapterCompleted] = useState<string>('');
  const [minutesRead, setMinutesRead] = useState<number>(20);
  const [selectedReaction, setSelectedReaction] = useState<string>('🚀');
  const [notes, setNotes] = useState<string>('');
  const [isBookFinished, setIsBookFinished] = useState<boolean>(false);

  // Success Celebration State
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{
    starsAwarded: number;
    bookTitle: string;
    chapter: string;
    timestamp: string;
    limitReached?: boolean;
    dailyClaimLimit?: number;
  } | null>(null);

  // Reading Focus Timer State
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(20 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Auto-fill active book on modal open if available
  useEffect(() => {
    if (kidShelf.length > 0) {
      const active = kidShelf.find((b) => !b.isFinished) || kidShelf[0];
      if (active) {
        setSelectedBookId(active.id);
        setBookTitle(active.title);
        setAuthor(active.author || '');
        setCoverEmoji(active.coverEmoji || '📖');
        // Predict next chapter if last was "Chapter X"
        const match = active.lastChapterRead.match(/^(?:chapter|ch)\s*0*(\d+)/i);
        if (match) {
          const nextNum = parseInt(match[1], 10) + 1;
          setChapterCompleted(`Chapter ${nextNum}`);
        } else {
          setChapterCompleted('');
        }
      }
    }
  }, [kid.id]);

  // Focus Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            sound.playChoreComplete();
            fireConfetti();
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  // ANTI-CHEAT: Check for exact same book and chapter already logged
  const duplicateLog = useMemo(() => {
    if (!bookTitle.trim() || !chapterCompleted.trim()) return undefined;
    return findDuplicateChapterLog(allLogs, kid.id, bookTitle, chapterCompleted);
  }, [allLogs, kid.id, bookTitle, chapterCompleted]);

  const hasAlreadyReadToday = stats.readToday;

  const handleSelectBook = (book: KidBookShelfItem) => {
    sound.playTap();
    setSelectedBookId(book.id);
    setBookTitle(book.title);
    setAuthor(book.author || '');
    setCoverEmoji(book.coverEmoji || '📖');

    const match = book.lastChapterRead.match(/^(?:chapter|ch)\s*0*(\d+)/i);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      setChapterCompleted(`Chapter ${nextNum}`);
    } else {
      setChapterCompleted('');
    }
  };

  const handleSelectStarterBook = (starter: (typeof STARTER_BOOK_IDEAS)[0]) => {
    sound.playTap();
    setSelectedBookId('');
    setBookTitle(starter.title);
    setAuthor(starter.author);
    setCoverEmoji(starter.coverEmoji);
    setChapterCompleted('Chapter 1');
  };

  const handleStartNewBook = () => {
    sound.playTap();
    setSelectedBookId('');
    setBookTitle('');
    setAuthor('');
    setCoverEmoji('📖');
    setChapterCompleted('Chapter 1');
    setIsBookFinished(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !chapterCompleted.trim()) return;

    if (duplicateLog) {
      sound.playWarning();
      return;
    }

    const now = new Date();
    const timestampISO = now.toISOString();
    const formattedTimestamp = formatReadingTimestamp(timestampISO);

    // Calculate stars to award based on admin claim limit
    const starsEarned = isLimitReached ? 0 : rewardStars;

    // 1. Create new ReadingLogEntry
    const newEntry: ReadingLogEntry = {
      id: `read-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      kidId: kid.id,
      bookTitle: bookTitle.trim(),
      chapterCompleted: chapterCompleted.trim(),
      normalizedBookTitle: normalizeBookTitle(bookTitle),
      normalizedChapter: normalizeChapter(chapterCompleted),
      timestamp: timestampISO,
      date: todayStr,
      minutesRead,
      notes: notes.trim() || undefined,
      reactionEmoji: selectedReaction,
      starsAwarded: starsEarned,
      isBookFinished,
      claimLimitReached: isLimitReached,
    };

    // 2. Update Kid's Reading Shelf
    let updatedShelf = [...kidShelf];
    const existingIndex = updatedShelf.findIndex(
      (b) => normalizeBookTitle(b.title) === normalizeBookTitle(bookTitle)
    );

    if (existingIndex >= 0) {
      const existing = updatedShelf[existingIndex];
      const completedList = existing.completedChapters.includes(chapterCompleted.trim())
        ? existing.completedChapters
        : [...existing.completedChapters, chapterCompleted.trim()];

      updatedShelf[existingIndex] = {
        ...existing,
        author: author.trim() || existing.author,
        coverEmoji: coverEmoji || existing.coverEmoji,
        lastChapterRead: chapterCompleted.trim(),
        completedChapters: completedList,
        lastReadAt: timestampISO,
        isFinished: isBookFinished,
        finishedAt: isBookFinished ? timestampISO : existing.finishedAt,
        totalMinutesRead: (existing.totalMinutesRead || 0) + minutesRead,
      };
    } else {
      const newBook: KidBookShelfItem = {
        id: `book-${Date.now()}`,
        title: bookTitle.trim(),
        author: author.trim() || undefined,
        coverEmoji,
        lastChapterRead: chapterCompleted.trim(),
        completedChapters: [chapterCompleted.trim()],
        startedAt: timestampISO,
        lastReadAt: timestampISO,
        isFinished: isBookFinished,
        finishedAt: isBookFinished ? timestampISO : undefined,
        totalMinutesRead: minutesRead,
      };
      updatedShelf.unshift(newBook);
    }

    // 3. Mark the reading chore as completed for today in database.logs
    let updatedLogs = [...(database.logs || [])];

    if (readingChore) {
      const existingChoreLogIndex = updatedLogs.findIndex(
        (l) => l.kidId === kid.id && l.choreId === readingChore.id && l.date === todayStr
      );

      const choreSubtaskLog = [
        `📖 "${bookTitle.trim()}" - ${chapterCompleted.trim()}`,
        `⏱️ ${minutesRead} mins read (${formattedTimestamp})`,
        ...(notes.trim() ? [`💭 "${notes.trim()}"`] : []),
      ];

      if (existingChoreLogIndex >= 0) {
        // Already completed today, append notes
        const existingLog = updatedLogs[existingChoreLogIndex];
        updatedLogs[existingChoreLogIndex] = {
          ...existingLog,
          completedSubtasks: Array.from(new Set([...(existingLog.completedSubtasks || []), ...choreSubtaskLog])),
        };
      } else {
        // First completion today: award stars
        updatedLogs.push({
          id: `log-read-${Date.now()}`,
          choreId: readingChore.id,
          kidId: kid.id,
          date: todayStr,
          status: 'completed',
          completedAt: timestampISO,
          starsAwarded: starsEarned,
          completedSubtasks: choreSubtaskLog,
        });
      }
    }

    // 4. Update Kid's stars & profile
    const updatedKids = database.kids.map((k) => {
      if (k.id === kid.id) {
        return {
          ...k,
          stars: k.stars + starsEarned,
          lifetimeStars: (k.lifetimeStars || k.stars) + starsEarned,
          readingShelf: updatedShelf,
          lastActiveDate: todayStr,
        };
      }
      return k;
    });

    // 5. Update Database
    const updatedDatabase: FamilyDatabase = {
      ...database,
      kids: updatedKids,
      readingLogs: [newEntry, ...(database.readingLogs || [])],
      logs: updatedLogs,
    };

    onUpdateDatabase(updatedDatabase);

    // Sound & Confetti celebration
    if (starsEarned > 0) {
      sound.playStarEarned();
    }
    sound.playChoreComplete();
    fireConfetti();

    setSuccessInfo({
      starsAwarded: starsEarned,
      bookTitle: bookTitle.trim(),
      chapter: chapterCompleted.trim(),
      timestamp: formattedTimestamp,
      limitReached: isLimitReached,
      dailyClaimLimit,
    });
    setIsSuccess(true);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const cardContent = (
    <>
      {/* Decorative Top Accent Bar */}
        <div className="h-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

        {/* Header */}
        <div className="px-5 sm:px-7 pt-4 pb-3 flex items-center justify-between border-b border-amber-200/80 bg-white/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md ring-2 ring-amber-300 shrink-0">
              {coverEmoji || '📖'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-serif tracking-tight">
                  Reading Adventure
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-black flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  {dailyClaimLimit === 0 ? (
                    <span>+{rewardStars} Stars • Unlimited Claims</span>
                  ) : isLimitReached ? (
                    <span className="text-amber-950">Limit Reached ({claimsToday}/{dailyClaimLimit} today)</span>
                  ) : (
                    <span>+{rewardStars} Stars • Claim {claimsToday + 1} of {dailyClaimLimit}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-amber-800">
                <span>Reader: {kid.name}</span>
                {stats.streak > 0 && (
                  <span className="flex items-center gap-1 text-orange-600 font-extrabold bg-orange-100 px-1.5 py-0.2 rounded-md">
                    <Flame className="w-3 h-3 fill-orange-500 text-orange-600" />
                    {stats.streak} Day Streak!
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition-all cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-amber-200 bg-amber-100/60 px-5 sm:px-7 py-2 gap-2 overflow-x-auto">
          <button
            id="tab-reading-log"
            onClick={() => {
              sound.playTap();
              setActiveTab('log');
            }}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'log'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white/60 text-amber-900 hover:bg-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Log Today’s Chapter</span>
          </button>

          <button
            id="tab-reading-timer"
            onClick={() => {
              sound.playTap();
              setActiveTab('timer');
            }}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'timer'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white/60 text-amber-900 hover:bg-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>20-Min Focus Timer</span>
          </button>

          <button
            id="tab-reading-journal"
            onClick={() => {
              sound.playTap();
              setActiveTab('journal');
            }}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'journal'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white/60 text-amber-900 hover:bg-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>My Reading Journal ({stats.totalChapters})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {/* SUCCESS SCREEN */}
          {isSuccess && successInfo ? (
            <div className="text-center py-6 sm:py-8 animate-fade-in flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-400 text-emerald-600 flex items-center justify-center text-4xl shadow-xl mb-4 animate-bounce">
                🎉
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif mb-2">
                Awesome Reading, {kid.name}!
              </h3>

              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 max-w-md w-full mb-5 text-left">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800">Book Completed</span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full">
                    {successInfo.timestamp}
                  </span>
                </div>
                <p className="text-lg font-black text-emerald-950 mt-2">
                  {successInfo.bookTitle}
                </p>
                <p className="text-sm font-extrabold text-emerald-800">
                  {successInfo.chapter}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>"Complete daily reading" chore checked off!</span>
                </div>
              </div>

              {successInfo.starsAwarded > 0 ? (
                <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 font-black text-sm shadow-sm">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-600" />
                  <span>Earned +{successInfo.starsAwarded} Stars for reading adventure!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-2xl bg-sky-100 border border-sky-300 text-sky-900 font-extrabold text-xs sm:text-sm shadow-sm text-center">
                  <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
                  <span>Daily star claim limit reached for today ({successInfo.dailyClaimLimit} of {successInfo.dailyClaimLimit}). Chapter logged & streak preserved!</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setActiveTab('journal');
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs sm:text-sm cursor-pointer"
                >
                  View My Journal
                </button>
                <button
                  onClick={() => {
                    sound.playTap();
                    onClose();
                    if (onPostComplete) onPostComplete();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer"
                >
                  Done Reading 🏠
                </button>
              </div>
            </div>
          ) : activeTab === 'timer' ? (
            /* FOCUS READING TIMER VIEW */
            <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center text-3xl shadow-lg mb-3">
                📖
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                20-Minute Focused Reading Timer
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-1 mb-6">
                Find a cozy, quiet spot, open your book, and enjoy your reading adventure!
              </p>

              {/* Big Timer Circle */}
              <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-8 border-amber-400 bg-white flex flex-col items-center justify-center shadow-xl mb-6 relative">
                <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight font-mono">
                  {formatTimer(timerSecondsLeft)}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 mt-1">
                  {isTimerRunning ? 'Reading in Progress...' : timerSecondsLeft === 0 ? 'Session Complete! 🎉' : 'Ready to Read'}
                </span>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    sound.playTap();
                    setIsTimerRunning(!isTimerRunning);
                  }}
                  className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{isTimerRunning ? 'Pause Timer' : 'Start Reading'}</span>
                </button>

                <button
                  onClick={() => {
                    sound.playTap();
                    setIsTimerRunning(false);
                    setTimerSecondsLeft(20 * 60);
                  }}
                  className="px-4 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-sm flex items-center gap-1.5 cursor-pointer"
                  title="Reset to 20 mins"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200/80 w-full max-w-md">
                <button
                  onClick={() => {
                    sound.playTap();
                    setActiveTab('log');
                  }}
                  className="text-xs font-extrabold text-amber-800 hover:text-amber-950 underline flex items-center justify-center gap-1 mx-auto"
                >
                  Finished reading? Click here to log your chapter! &rarr;
                </button>
              </div>
            </div>
          ) : activeTab === 'journal' ? (
            /* MY READING JOURNAL VIEW */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-serif">
                    {kid.name}'s Reading Adventure Log
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {stats.totalChapters} chapters logged • {stats.totalMinutes} total minutes explored
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playTap();
                    setActiveTab('log');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log New Chapter</span>
                </button>
              </div>

              {/* Reading Shelf Cards */}
              {kidShelf.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                    My Bookshelf ({kidShelf.length} Books)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {kidShelf.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          handleSelectBook(b);
                          setActiveTab('log');
                        }}
                        className="p-3 rounded-2xl bg-white border-2 border-amber-200 hover:border-amber-400 shadow-sm flex items-start gap-3 transition-all cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                          {b.coverEmoji || '📖'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                              {b.title}
                            </h5>
                            {b.isFinished && (
                              <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded shrink-0">
                                🏆 Finished
                              </span>
                            )}
                          </div>
                          {b.author && (
                            <p className="text-[11px] text-slate-500 truncate">by {b.author}</p>
                          )}
                          <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-amber-800">
                            <span>Last read: {b.lastChapterRead}</span>
                            <span className="text-slate-400 font-medium">
                              {formatReadingTimestamp(b.lastReadAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamped Audit Logs */}
              <div className="pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2">
                  Recent Reading Log Entries
                </h4>
                {stats.recentLogs.length === 0 ? (
                  <div className="text-center py-8 bg-white/70 rounded-2xl border-2 border-dashed border-amber-200 p-6">
                    <p className="text-sm font-bold text-amber-900">No chapters logged yet!</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Pick a book and record your first chapter to start your reading streak.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-2xl shrink-0 mt-0.5">{log.reactionEmoji || '📖'}</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-slate-900 font-serif">
                                {log.bookTitle}
                              </span>
                              <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-full">
                                {log.chapterCompleted}
                              </span>
                              {log.isBookFinished && (
                                <span className="text-[10px] font-black text-white bg-amber-600 px-1.5 py-0.2 rounded">
                                  Book Completed 🏆
                                </span>
                              )}
                            </div>
                            {log.notes && (
                              <p className="text-xs text-slate-600 italic mt-0.5">
                                "{log.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between text-[11px] text-slate-500 font-medium shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <span className="font-bold text-emerald-700">+{log.starsAwarded} ⭐</span>
                          <span>{formatReadingTimestamp(log.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* MAIN CHAPTER LOGGING FORM */
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              {/* Daily status banner if already read today */}
              {hasAlreadyReadToday && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {kid.name} already completed today's reading chore! You can still log more chapters to keep your book shelf updated.
                    </span>
                  </div>
                </div>
              )}

              {/* Active Book Shelf Quick Pick (if child has active books) */}
              {kidShelf.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                      <span>Select From Your Shelf</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleStartNewBook}
                      className="text-xs font-extrabold text-amber-700 hover:text-amber-950 underline cursor-pointer"
                    >
                      + Start a New Book
                    </button>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {kidShelf.map((b) => {
                      const isSelected = normalizeBookTitle(b.title) === normalizeBookTitle(bookTitle);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleSelectBook(b)}
                          className={`px-3 py-2 rounded-2xl border-2 text-left shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-amber-600 border-amber-700 text-white shadow-md'
                              : 'bg-white border-amber-200 text-slate-800 hover:border-amber-400'
                          }`}
                        >
                          <span className="text-xl">{b.coverEmoji || '📖'}</span>
                          <div className="min-w-0 max-w-[140px]">
                            <p className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {b.title}
                            </p>
                            <p className={`text-[10px] font-medium truncate ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                              {b.lastChapterRead || 'In progress'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Starter Book Ideas (if shelf is completely empty) */}
              {kidShelf.length === 0 && (
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-amber-950 block mb-1.5">
                    Need an idea? Pick a popular book or type your own:
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {STARTER_BOOK_IDEAS.slice(0, 4).map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectStarterBook(idea)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-slate-800 text-left shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="text-lg">{idea.coverEmoji}</span>
                        <div className="max-w-[130px]">
                          <p className="text-xs font-bold truncate text-slate-900">{idea.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Title & Cover Emoji Field */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-amber-950 block mb-1.5">
                  Book Name *
                </label>
                <div className="flex gap-2">
                  <div className="relative shrink-0">
                    <select
                      value={coverEmoji}
                      onChange={(e) => setCoverEmoji(e.target.value)}
                      className="min-h-[46px] px-2.5 rounded-2xl bg-white border-2 border-amber-300 text-xl font-bold cursor-pointer hover:border-amber-500 shadow-xs appearance-none text-center"
                      title="Choose book icon"
                    >
                      {EMOJI_COVERS.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    id="input-reading-book-title"
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="e.g. Percy Jackson, Harry Potter, Charlotte's Web..."
                    className="flex-1 min-h-[46px] px-4 rounded-2xl bg-white border-2 border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none text-sm font-bold text-slate-900 shadow-xs"
                  />
                </div>
              </div>

              {/* Chapter Completed Field with ANTI-CHEAT VALIDATION */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <span>What Chapter Did You Complete? *</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    (e.g., "Chapter 4" or "Pages 25-45")
                  </span>
                </div>
                <input
                  id="input-reading-chapter"
                  type="text"
                  required
                  value={chapterCompleted}
                  onChange={(e) => setChapterCompleted(e.target.value)}
                  placeholder="e.g. Chapter 4: The Secret Forest"
                  className={`w-full min-h-[46px] px-4 rounded-2xl bg-white border-2 outline-none text-sm font-bold text-slate-900 shadow-xs ${
                    duplicateLog
                      ? 'border-orange-500 bg-orange-50/50 text-orange-950 focus:ring-2 focus:ring-orange-300'
                      : 'border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-200'
                  }`}
                />

                {/* ANTI-CHEAT ALERT BANNER */}
                {duplicateLog && (
                  <div
                    id="reading-duplicate-alert"
                    className="mt-2 p-3.5 rounded-2xl bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-400 text-orange-950 flex items-start gap-2.5 shadow-sm animate-fade-in"
                  >
                    <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-black text-orange-900">
                        Chapter Already Logged & Claimed!
                      </p>
                      <p className="mt-0.5 font-medium text-orange-800">
                        You already conquered <span className="font-bold">"{duplicateLog.chapterCompleted}"</span> in{' '}
                        <span className="font-bold">{duplicateLog.bookTitle}</span> on{' '}
                        {formatReadingTimestamp(duplicateLog.timestamp)}.
                      </p>
                      <p className="mt-1 text-[11px] font-extrabold text-orange-900">
                        ⭐ To claim today's reading points, please log your next chapter or select a different book!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Minutes Read & Reaction Picker in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Minutes Read */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-amber-950 block mb-1.5">
                    Minutes Spent Reading
                  </label>
                  <div className="flex gap-1.5">
                    {[15, 20, 30, 45].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMinutesRead(m)}
                        className={`flex-1 min-h-[42px] rounded-xl font-black text-xs transition-all cursor-pointer ${
                          minutesRead === m
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white border border-amber-300 text-slate-700 hover:bg-amber-100'
                        }`}
                      >
                        {m} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Finish Whole Book Checkbox */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border-2 border-amber-200 hover:border-amber-400 cursor-pointer shadow-xs select-none">
                    <input
                      type="checkbox"
                      checked={isBookFinished}
                      onChange={(e) => setIsBookFinished(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-xs font-black text-amber-950 flex items-center gap-1">
                        🏆 Finished Entire Book Today!
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Celebrates completing the whole novel
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Reaction Picker */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-amber-950 block mb-1.5">
                  How Was Today’s Reading?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REACTION_OPTIONS.map((r) => {
                    const isChosen = selectedReaction === r.emoji;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          setSelectedReaction(r.emoji);
                        }}
                        className={`p-2 rounded-2xl border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isChosen
                            ? 'bg-amber-100 border-amber-600 shadow-sm'
                            : 'bg-white border-amber-200 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{r.emoji}</span>
                        <span className="text-xs font-black text-slate-800 leading-tight">
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Thoughts / Comprehension Note */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-amber-950 block mb-1.5">
                  What was your favorite part or one cool sentence? (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. When they found the hidden passage under the library floor!"
                  className="w-full min-h-[44px] px-4 rounded-2xl bg-white border-2 border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none text-xs font-medium text-slate-900 shadow-xs"
                />
              </div>

              {/* Daily Claim Limit Info Banner if reached */}
              {isLimitReached && (
                <div className="p-3.5 rounded-2xl bg-amber-100/90 border-2 border-amber-300 text-amber-950 text-xs flex items-start gap-2.5 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black">Daily Star Limit Reached ({claimsToday}/{dailyClaimLimit} claimed today). </span>
                    <span className="font-medium text-amber-900">
                      You've already claimed all star rewards for today! You can still log this chapter to keep your reading streak alive, expand your bookshelf, and track your focus minutes.
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="btn-submit-reading-log"
                  type="submit"
                  disabled={!bookTitle.trim() || !chapterCompleted.trim() || !!duplicateLog}
                  className={`w-full min-h-[52px] py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                    !bookTitle.trim() || !chapterCompleted.trim() || !!duplicateLog
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : isLimitReached
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white cursor-pointer ring-2 ring-amber-300'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white cursor-pointer ring-2 ring-amber-300'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>
                    {duplicateLog
                      ? 'Duplicate Chapter - Change Chapter to Continue'
                      : isLimitReached
                      ? `Log Adventure to Bookshelf (0 ⭐ • Limit Reached ${claimsToday}/${dailyClaimLimit})`
                      : `Claim +${rewardStars} Stars & Log Adventure ✨`}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
    </>
  );

  if (embedded) {
    return (
      <div id="reading-log-view" className="w-full max-w-4xl mx-auto space-y-3 animate-fade-in">
        <div className="flex items-center justify-between">
          <button
            id="btn-back-reading-log"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-black text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Missions</span>
          </button>
        </div>

        <div
          id="reading-log-card"
          className="relative w-full rounded-3xl bg-gradient-to-b from-amber-50 via-white to-orange-50 border-2 sm:border-4 border-amber-300 shadow-xl overflow-hidden flex flex-col"
        >
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div
      id="reading-log-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div
        id="reading-log-modal-card"
        className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-amber-50 via-white to-orange-50 border-4 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {cardContent}
      </div>
    </div>
  );
};
