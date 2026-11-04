import React, { useRef } from 'react';
import {
  TrendingUp,
  Target,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Calendar,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  Flame,
  Volume2,
  Apple,
  Download,
  Github,
} from 'lucide-react';
import { DayJournal, TradeItem, ScreenshotItem, SetupConfig } from '../../types/trading';
import { CalculatedStats } from '../../utils/storage';
import { sound } from '../../utils/audio';

interface DailyTabProps {
  currentDay: number;
  onSelectDay: (day: number) => void;
  journal: DayJournal;
  onChangeJournal: (journal: DayJournal) => void;
  stats: CalculatedStats;
  setup: SetupConfig;
  onOpenTradeModal: () => void;
  onCheckDailyGoal: () => void;
  onOpenInstallModal?: (tab?: 'download_ipa' | 'github_sync') => void;
}

export const DailyTab: React.FC<DailyTabProps> = ({
  currentDay,
  onSelectDay,
  journal,
  onChangeJournal,
  stats,
  setup,
  onOpenTradeModal,
  onCheckDailyGoal,
  onOpenInstallModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const daysCarouselRef = useRef<HTMLDivElement>(null);

  const handleDayClick = (day: number) => {
    sound.playTap();
    onSelectDay(day);
  };

  const scrollDays = (dir: 'left' | 'right') => {
    if (daysCarouselRef.current) {
      const scrollAmt = dir === 'left' ? -200 : 200;
      daysCarouselRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  const handleEmotionSelect = (val: number) => {
    sound.playTap();
    onChangeJournal({ ...journal, emotion: val });
  };

  const handleDeleteTrade = (id: string) => {
    sound.playTap();
    const updated = journal.trades.filter((t) => t.id !== id);
    onChangeJournal({ ...journal, trades: updated });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 960;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/webp', 0.65);
          const newScreenshot: ScreenshotItem = {
            id: `shot-${Date.now()}`,
            img: compressed,
            desc: '',
            timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          };
          sound.playSuccess();
          onChangeJournal({
            ...journal,
            screenshots: [...journal.screenshots, newScreenshot],
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteScreenshot = (id: string) => {
    sound.playTap();
    const updated = journal.screenshots.filter((s) => s.id !== id);
    onChangeJournal({ ...journal, screenshots: updated });
  };

  const handleScreenshotDescChange = (id: string, desc: string) => {
    const updated = journal.screenshots.map((s) => (s.id === id ? { ...s, desc } : s));
    onChangeJournal({ ...journal, screenshots: updated });
  };

  const emotionColors: Record<number, string> = {
    10: 'bg-cyan-500 text-black',
    9: 'bg-cyan-400 text-black',
    8: 'bg-emerald-500 text-black',
    7: 'bg-emerald-400 text-black',
    6: 'bg-lime-500 text-black',
    5: 'bg-yellow-500 text-black',
    4: 'bg-amber-500 text-black',
    3: 'bg-orange-500 text-white',
    2: 'bg-rose-500 text-white',
    1: 'bg-red-600 text-white',
  };

  const isDailyGoalMet = stats.todayUSD >= 300;

  return (
    <div className="space-y-4 pb-24 pt-2 px-3.5 select-none" dir="rtl">
      {/* 🍏 Prominent Download IPA & GitHub Release Hub Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-purple-950/70 border border-cyan-500/40 shadow-xl shadow-cyan-950/40 relative overflow-hidden animate-fade-in">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 p-0.5 shrink-0 shadow-md shadow-cyan-500/25">
              <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
                <Apple className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xs text-white">دانلود فایل IPA و همگام‌سازی گیت‌هاب</h3>
                <span className="text-[9px] font-mono font-black px-1.5 py-0.2 bg-cyan-400 text-black rounded-md">
                  iOS / Releases
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                دانلود مستقیم فایل .ipa یا انتشار خودکار با GitHub Actions Workflow در صفحه Releases
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              sound.playTap();
              onOpenInstallModal?.('github_sync');
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-[11px] flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Github className="w-3.5 h-3.5" />
            <span>گیت‌هاب و Workflow</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenInstallModal?.('download_ipa');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-extrabold text-[11px] flex items-center gap-1.5 shadow-md shadow-cyan-500/30 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود مستقیم IPA</span>
          </button>
        </div>
      </div>

      {/* 60-Day Horizontal Carousel */}
      <div className="ios-card-sm p-2.5">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-white">انتخاب روز چالش (Day {currentDay})</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollDays('right')}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollDays('left')}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          ref={daysCarouselRef}
          className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 pt-0.5 scroll-smooth"
        >
          {Array.from({ length: 60 }, (_, i) => i + 1).map((day) => {
            const isSelected = day === currentDay;
            const isMilestone = day % 20 === 0;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center shrink-0 font-mono text-xs font-bold transition-all ios-btn ${
                  isSelected
                    ? 'bg-gradient-to-tr from-cyan-500 to-cyan-400 text-black shadow-md shadow-cyan-500/30 scale-105 ring-2 ring-cyan-300'
                    : isMilestone
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{day}</span>
                {isMilestone && (
                  <span className="w-1 h-1 rounded-full bg-purple-400 -mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Psychological Emotion Score Bar */}
      <div className="ios-card-sm p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-white">وضعیت روانی و آرامش (Psychological State)</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-cyan-400">
            سطح {journal.emotion || 8}/10
          </span>
        </div>

        <div className="grid grid-cols-10 gap-1" dir="ltr">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
            const isSelected = journal.emotion === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleEmotionSelect(val)}
                className={`h-9 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-all ios-btn ${
                  isSelected
                    ? `${emotionColors[val]} shadow-sm ring-2 ring-white/50 scale-105`
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
          <span className="text-rose-400 font-medium">۱ = خشم، فومو و انتقام</span>
          <span className="text-cyan-400 font-medium">۱۰ = تسلط، نظم و آرامش کامل</span>
        </div>
      </div>

      {/* Day Performance Card & Visual Goal Progress Bar */}
      {(() => {
        const DAILY_TARGET_MIN = 300;
        const DAILY_TARGET_FULL = 500;
        const percentAchieved = stats.todayUSD > 0
          ? Math.round((stats.todayUSD / DAILY_TARGET_FULL) * 100)
          : 0;
        const progressWidth = Math.min(100, Math.max(0, (stats.todayUSD / DAILY_TARGET_FULL) * 100));
        const remainingUSD = Math.max(0, DAILY_TARGET_FULL - stats.todayUSD);

        return (
          <div className="ios-card p-4 relative overflow-hidden space-y-3.5">
            {/* Header: Performance & Percentage Badge */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">عملکرد روز {currentDay}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                <div className="flex items-baseline gap-2 mt-0.5" dir="ltr">
                  <span className={`text-2xl font-black font-mono transition-colors duration-500 ${stats.todayUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stats.todayUSD >= 0 ? '+' : ''}${stats.todayUSD.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    ({stats.todayR >= 0 ? '+' : ''}{stats.todayR}R)
                  </span>
                </div>
              </div>

              {/* Goal Percentage Pill */}
              <div className="text-left flex flex-col items-end">
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all duration-500 ${
                    percentAchieved >= 100
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                      : percentAchieved >= 60
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : stats.todayUSD > 0
                      ? 'bg-white/10 text-cyan-400 border-white/10'
                      : stats.todayUSD < 0
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-white/5 text-slate-400 border-white/5'
                  }`}
                  dir="ltr"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{percentAchieved}%</span>
                  <span className="font-sans text-[10px] font-medium text-slate-300">
                    {percentAchieved >= 100 ? 'محقق شد! 🏆' : 'هدف'}
                  </span>
                </div>

                {isDailyGoalMet && (
                  <button
                    onClick={onCheckDailyGoal}
                    className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-0.5 rounded-md transition-all animate-pulse"
                  >
                    <Award className="w-3 h-3" />
                    تبریک صوتی تارگت
                  </button>
                )}
              </div>
            </div>

            {/* Visual Animated Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <span>پیشرفت هدف روزانه ($۳۰۰ — $۵۰۰)</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-cyan-300" dir="ltr">
                  ${Math.max(0, stats.todayUSD).toLocaleString()} / ${DAILY_TARGET_FULL.toLocaleString()}
                </span>
              </div>

              {/* Outer Bar */}
              <div
                className="w-full h-3.5 bg-[#0b0e15] rounded-full p-0.5 border border-white/10 relative overflow-hidden shadow-inner"
                dir="ltr"
              >
                {/* 60% Minimum Threshold Marker ($300) */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-10"
                  style={{ left: '60%' }}
                  title="حداقل هدف ($300)"
                />

                {/* Animated Gradient Fill */}
                <div
                  className="h-full rounded-full relative transition-all duration-800 ease-out flex items-center justify-end"
                  style={{
                    width: `${progressWidth}%`,
                    background:
                      percentAchieved >= 100
                        ? 'linear-gradient(90deg, #00f0ff 0%, #10b981 60%, #34d399 100%)'
                        : percentAchieved >= 60
                        ? 'linear-gradient(90deg, #00f0ff 0%, #06b6d4 50%, #10b981 100%)'
                        : 'linear-gradient(90deg, #0284c7 0%, #00f0ff 100%)',
                    boxShadow: progressWidth > 0 ? '0 0 12px rgba(0, 240, 255, 0.4)' : 'none',
                  }}
                >
                  {/* Leading Dot Pulse */}
                  {progressWidth > 3 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md mr-0.5 shrink-0 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Milestone Labels */}
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono px-0.5 pt-0.5" dir="ltr">
                <span>$0</span>
                <span className="text-cyan-400 font-bold">Min: $300 (60%)</span>
                <span className={percentAchieved >= 100 ? 'text-emerald-400 font-bold' : ''}>Target: $500 (100%)</span>
              </div>

              {/* Status Note */}
              <div className="text-[10px] text-slate-400 pt-0.5">
                {percentAchieved >= 100 ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    ✨ فوق‌العاده! هدف روزانه محقق شد. طبق پلن پلتفرم را ببندید و اورترید نکنید.
                  </span>
                ) : percentAchieved >= 60 ? (
                  <span className="text-cyan-300 font-medium">
                    🎯 به کف مجاز هدف ($۳۰۰) رسیدید. باقی‌مانده تا سقف هدف: ${remainingUSD.toLocaleString()}
                  </span>
                ) : stats.todayUSD > 0 ? (
                  <span>
                    ⏳ ${remainingUSD.toLocaleString()} تا تکمیل ۱۰۰٪ هدف روزانه فاصله دارید.
                  </span>
                ) : stats.todayUSD < 0 ? (
                  <span className="text-rose-400 font-medium">
                    ⚠️ امروز در محدوده دراودان (${Math.abs(stats.todayUSD).toLocaleString()}) هستید. به حد ضرر مجاز وفادار بمانید.
                  </span>
                ) : (
                  <span>آماده ثبت اولین معامله طبق ستاپ تایید شده.</span>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Goal & Pre-Market Inputs */}
      <div className="ios-card-sm p-3.5 space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            🎯 هدف انضباطی امروز
          </label>
          <input
            type="text"
            value={journal.goal}
            onChange={(e) => onChangeJournal({ ...journal, goal: e.target.value })}
            placeholder="مثال: جابجا نکردن حد ضرر و خروج به موقع در TP"
            className="ios-input w-full p-2.5 text-xs text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            📝 آمادگی پیش از بازار (Pre-Market)
          </label>
          <textarea
            value={journal.pre}
            onChange={(e) => onChangeJournal({ ...journal, pre: e.target.value })}
            placeholder="بررسی سطوح کلیدی، زمان انتشار اخبار مهم و روند مارکت..."
            className="ios-input w-full p-2.5 h-18 text-xs text-slate-100"
          />
        </div>
      </div>

      {/* Trades Log Section */}
      <div className="ios-card p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white">
              معاملات ثبت‌شده روز ({journal.trades.length})
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onOpenTradeModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1 shadow-sm ios-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            ثبت معامله
          </button>
        </div>

        {journal.trades.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl">
            <p className="text-xs text-slate-400 mb-2">امروز هنوز معامله‌ای ثبت نشده است.</p>
            <button
              onClick={() => {
                sound.playTap();
                onOpenTradeModal();
              }}
              className="text-xs text-cyan-400 font-bold hover:underline"
            >
              اولین موقعیت امروز را لاگ کنید
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {journal.trades.map((t) => {
              const tradeProfit = t.r * setup.riskValue;
              const isProfit = t.r >= 0;

              return (
                <div
                  key={t.id}
                  className="ios-inset p-3 border border-white/5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-[10px] ${
                        t.direction === 'SELL'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {t.direction || 'BUY'}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-xs text-white" dir="ltr">
                          {t.symbol}
                        </span>
                        {t.sentiment && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold border ${
                            t.sentiment === 'Confident' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' :
                            t.sentiment === 'Nervous' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                            t.sentiment === 'Bored' ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' :
                            t.sentiment === 'Aggressive' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                            t.sentiment === 'FOMO' ? 'bg-orange-500/15 text-orange-300 border-orange-500/30' :
                            'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {t.sentiment}
                          </span>
                        )}
                        {t.time && (
                          <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                            {t.time}
                          </span>
                        )}
                      </div>
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mt-0.5" dir="ltr">
                          {t.tags.map((tag) => (
                            <span key={tag} className="text-[9px] font-mono text-cyan-300/80 bg-cyan-500/10 px-1 py-0.2 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {t.notes && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5">
                          {t.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-left" dir="ltr">
                      <span className={`font-mono font-bold text-xs block ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}{t.r}R
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 block">
                        {isProfit ? '+' : ''}${tradeProfit.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteTrade(t.id)}
                      className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center ios-btn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart Screenshots Section */}
      <div className="ios-card p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white">
              اسکرین‌شات‌ها و چارت‌های روز ({journal.screenshots.length})
            </h3>
          </div>

          <label className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1 cursor-pointer ios-btn">
            <Plus className="w-3.5 h-3.5" />
            آپلود چارت
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {journal.screenshots.length === 0 ? (
          <div className="text-center py-5 border border-dashed border-white/5 rounded-2xl">
            <p className="text-xs text-slate-400 mb-1">عکسی برای این روز بارگذاری نشده است.</p>
            <p className="text-[10px] text-slate-500">
              تصاویر به‌صورت خودکار جهت سرعت بالا فشرده می‌شوند.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {journal.screenshots.map((s) => (
              <div
                key={s.id}
                className="ios-inset p-2.5 border border-white/5 space-y-2 rounded-2xl overflow-hidden"
              >
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                  <img
                    src={s.img}
                    alt="Trading Chart"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => handleDeleteScreenshot(s.id)}
                    className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white backdrop-blur-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={s.desc}
                  onChange={(e) => handleScreenshotDescChange(s.id, e.target.value)}
                  placeholder="توضیح دلایل ستاپ روی چارت..."
                  className="ios-input w-full p-2 text-xs"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discipline Quality & Audit */}
      <div className="ios-card p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">کیفیت رعایت انضباط معاملاتی</span>
          <span className="text-sm font-mono font-black text-cyan-400">
            {journal.score || 0} / ۵
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={journal.score || 0}
          onChange={(e) => onChangeJournal({ ...journal, score: parseFloat(e.target.value) || 0 })}
          className="w-full h-2 rounded-lg bg-slate-800 accent-cyan-400 cursor-pointer"
          dir="ltr"
        />

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">شواهد امتیاز داده شده:</label>
          <input
            type="text"
            value={journal.evidence}
            onChange={(e) => onChangeJournal({ ...journal, evidence: e.target.value })}
            placeholder="دقیقا طبق استراتژی و بدون عجله عمل کردم."
            className="ios-input w-full p-2 text-xs"
          />
        </div>

        {/* Out of plan trade check */}
        <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">آیا ورود خارج از پلن داشتید؟</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeJournal({ ...journal, noPlan: 'no' })}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  journal.noPlan === 'no'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                خیر
              </button>
              <button
                type="button"
                onClick={() => onChangeJournal({ ...journal, noPlan: 'yes' })}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  journal.noPlan === 'yes'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                بله
              </button>
            </div>
          </div>

          {journal.noPlan === 'yes' && (
            <input
              type="text"
              value={journal.noPlanReason}
              onChange={(e) => onChangeJournal({ ...journal, noPlanReason: e.target.value })}
              placeholder="دلیل تصمیم احساسی و ورود بی‌دلیل..."
              className="ios-input w-full p-2 text-xs border-rose-500/40"
            />
          )}
        </div>
      </div>

      {/* End of Day Audit */}
      <div className="ios-card-sm p-3.5 space-y-2.5 border-r-4 border-emerald-500">
        <span className="text-xs font-bold text-emerald-400 block">ارزیابی پایانی روز (Daily Audit)</span>
        
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">مهمترین درس امروز:</label>
          <textarea
            value={journal.auditLesson}
            onChange={(e) => onChangeJournal({ ...journal, auditLesson: e.target.value })}
            placeholder="چه الگو یا اشتباهی را هرگز نباید تکرار کنم؟"
            className="ios-input w-full p-2 h-16 text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">تعهد من برای فردا:</label>
          <input
            type="text"
            value={journal.auditCommit}
            onChange={(e) => onChangeJournal({ ...journal, auditCommit: e.target.value })}
            placeholder="پایبندی ۱۰۰٪ به حجم و ریسک مجاز روزانه."
            className="ios-input w-full p-2 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
