import { DayJournal, SetupConfig, ReviewData } from '../types/trading';

export const DEFAULT_SETUP: SetupConfig = {
  accountSize: 200000,
  propPhase: '1',
  riskValue: 1000,
  timeframe: '4H / 15m',
  stoploss: '-2R ($2,000)',
  markets: 'EUR/USD, GBP/USD, XAU/USD, BTC/USD, NAS100',
  setups: '۱. شکست ساختار (BOS / CHoCH) در تایم‌فریم ۴ ساعته\n۲. تاییدیه ورود در تایم‌فریم ۱۵ دقیقه با الگوی نقدینگی\n۳. حداقل نسبت ریسک به ریوارد ۱ به ۲\n۴. عدم ورود پیش از بسته شدن کندل تایید',
  noTrade: '• ۳۰ دقیقه قبل و بعد اخبار High Impact (NFP, CPI, FOMC)\n• خستگی ذهنی، خشم، استرس شدید یا انتقام‌جویی\n• خارج از تایم سشن‌های لندن و نیویورک\n• بعد از رسیدن به ۲ ضرر متوالی در یک روز',
  afterStop: 'بستن کامل متاتریدر/تریدینگ‌ویو و خاموش کردن سیستم تا ساعت ۸ صبح روز معاملاتی بعد بدون هیچ استثنائی.',
};

export const INITIAL_DAY_JOURNAL: DayJournal = {
  emotion: 8,
  goal: 'صبر برای تاییدیه کامل در ۱۵ دقیقه و پایبندی به حد ضرر اولیه',
  pre: 'بررسی اوردربلاک روزانه، اخبار تقویم اقتصادی و نقدینگی سشن آسیا',
  trades: [],
  screenshots: [],
  score: 4.5,
  evidence: 'تمام معاملات طبق چک‌لیست ستاپ اصلی و بدون دستکاری حد ضرر انجام شد.',
  noPlan: 'no',
  noPlanReason: '',
  auditLesson: 'بهترین سودها زمانی است که اجازه دادم قیمت به تارگت برسد.',
  auditCommit: 'فردا هیچ سفارشی را پیش از شروع سشن لندن باز نخواهم کرد.',
};

// Seed Day 1 and Day 2 if storage is completely empty so the user has realistic preview data
export function initializeSeedData(): void {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('trading-setup')) {
    localStorage.setItem('trading-setup', JSON.stringify(DEFAULT_SETUP));
  }

  if (!localStorage.getItem('trading-journal-day-1')) {
    const day1: DayJournal = {
      emotion: 9,
      goal: 'اجرای دقیق ستاپ شکست ساختار EURUSD و خروج منظم',
      pre: 'تست سطح مقاومتی 1.0850 در ۴ ساعته، نقدینگی بالای سقف لندن برداشته شد.',
      trades: [
        {
          id: 'trade-1-1',
          symbol: 'EUR/USD',
          entry: '1.08450',
          tp: '1.08900',
          sl: '1.08250',
          r: 2.25,
          direction: 'BUY',
          sentiment: 'Confident',
          tags: ['#swing', '#reversal'],
          time: '10:45',
          notes: 'شکست ساختار ۱۵ دقیقه + تاییدیه اینگالفینگ',
        },
        {
          id: 'trade-1-2',
          symbol: 'XAU/USD',
          entry: '2640.20',
          tp: '2648.00',
          sl: '2636.50',
          r: 1.10,
          direction: 'BUY',
          sentiment: 'Calm',
          tags: ['#scalp'],
          time: '14:20',
          notes: 'تست سطح اردر بلاک نیویورک',
        },
      ],
      screenshots: [],
      score: 4.8,
      evidence: 'بدون شتابزدگی، هر دو معامله مطابق با پلن ثبت شدند.',
      noPlan: 'no',
      noPlanReason: '',
      auditLesson: 'صبر برای رسیدن قیمت به زون تاییدیه بازدهی را چند برابر کرد.',
      auditCommit: 'فردا هم ریسک در هر پوزیشن را ثابت روی ۱R نگه می‌دارم.',
    };
    localStorage.setItem('trading-journal-day-1', JSON.stringify(day1));
  }

  if (!localStorage.getItem('trading-journal-day-2')) {
    const day2: DayJournal = {
      emotion: 7,
      goal: 'حفظ سود دیروز و کنترل فومو در سشن نیویورک',
      pre: 'منتظر انتشار شاخص مدعیان بیکاری و ریکشن طلا به مقاومت.',
      trades: [
        {
          id: 'trade-2-1',
          symbol: 'GBP/USD',
          entry: '1.2980',
          tp: '1.3040',
          sl: '1.2950',
          r: 1.5,
          direction: 'BUY',
          sentiment: 'Confident',
          tags: ['#news', '#breakout'],
          time: '11:15',
          notes: 'پولبک به سطح شکست پول هوشمند',
        },
      ],
      screenshots: [],
      score: 4.2,
      evidence: 'پایبندی به حد ریسک روزانه و بستن سیستم پس از کسب تارگت.',
      noPlan: 'no',
      noPlanReason: '',
      auditLesson: 'حرص نزدن برای معامله دوم باعث حفظ آرامش شد.',
      auditCommit: 'تمرین تنفس عمیق قبل از باز کردن چارت.',
    };
    localStorage.setItem('trading-journal-day-2', JSON.stringify(day2));
  }
}

export function getSetup(): SetupConfig {
  try {
    const raw = localStorage.getItem('trading-setup');
    if (!raw) return DEFAULT_SETUP;
    return { ...DEFAULT_SETUP, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETUP;
  }
}

export function saveSetup(setup: SetupConfig): void {
  try {
    localStorage.setItem('trading-setup', JSON.stringify(setup));
  } catch (e) {
    console.error('Error saving setup', e);
  }
}

export function getDayJournal(day: number): DayJournal {
  try {
    const raw = localStorage.getItem(`trading-journal-day-${day}`);
    if (!raw) return { ...INITIAL_DAY_JOURNAL };
    return { ...INITIAL_DAY_JOURNAL, ...JSON.parse(raw) };
  } catch {
    return { ...INITIAL_DAY_JOURNAL };
  }
}

export function saveDayJournal(day: number, data: DayJournal): void {
  try {
    localStorage.setItem(`trading-journal-day-${day}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving day journal', e);
  }
}

export function getReview(day: number): ReviewData {
  try {
    const raw = localStorage.getItem(`trading-journal-review-${day}`);
    if (!raw) {
      return {
        best: 'ستاپ شکست ساختار با تایید اردر بلاک در تایم ۱۵ دقیقه بالاترین وین‌ریت را داشت.',
        error: 'ورود زودهنگام قبل از بسته شدن کندل ۱۵ دقیقه و عجله در سشن نیویورک.',
        behavior: 'کنترل کامل ترس از دست دادن سود و توقف ترید بعد از رسیدن به تارگت روزانه.',
        next: 'افزایش حجم پوزیشن پس از پاس شدن فاز اول پراپ.',
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      best: '',
      error: '',
      behavior: '',
      next: '',
    };
  }
}

export function saveReview(day: number, data: ReviewData): void {
  try {
    localStorage.setItem(`trading-journal-review-${day}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving review', e);
  }
}

export interface CalculatedStats {
  totalR: number;
  totalProfitUSD: number;
  currentBalance: number;
  targetProfitUSD: number;
  progressPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgScore: number;
  scoredDaysCount: number;
  todayR: number;
  todayUSD: number;
  equityData: number[];
  moodCounts: number[];
}

export function calculateAllStats(currentDay: number, setup: SetupConfig): CalculatedStats {
  let totalR = 0;
  let totalTrades = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let totalScore = 0;
  let scoredDaysCount = 0;
  const equityData: number[] = [0];
  const moodCounts = Array(10).fill(0);

  for (let i = 1; i <= 60; i++) {
    const dayData = getDayJournal(i);
    let dayR = 0;
    
    (dayData.trades || []).forEach((t) => {
      const r = Number(t.r) || 0;
      dayR += r;
      totalTrades++;
      if (r > 0) winningTrades++;
      else if (r < 0) losingTrades++;
    });

    totalR += dayR;
    equityData.push(Number(totalR.toFixed(2)));

    if (dayData.score !== undefined && dayData.score !== null) {
      totalScore += Number(dayData.score);
      scoredDaysCount++;
    }

    if (dayData.emotion && dayData.emotion >= 1 && dayData.emotion <= 10) {
      moodCounts[Math.floor(dayData.emotion) - 1]++;
    }
  }

  const phaseTargets: Record<string, number> = { '1': 0.10, '2': 0.05 };
  const targetPercent = phaseTargets[setup.propPhase] || 0.10;
  const targetProfitUSD = setup.accountSize * targetPercent;
  const totalProfitUSD = totalR * setup.riskValue;
  const currentBalance = setup.accountSize + totalProfitUSD;
  const progressPercent = Math.min(100, Math.max(0, (totalProfitUSD / targetProfitUSD) * 100));

  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
  const avgScore = scoredDaysCount > 0 ? Number((totalScore / scoredDaysCount).toFixed(1)) : 0;

  // Today's Stats
  const todayJournal = getDayJournal(currentDay);
  let todayR = 0;
  (todayJournal.trades || []).forEach((t) => {
    todayR += Number(t.r) || 0;
  });
  const todayUSD = todayR * setup.riskValue;

  return {
    totalR: Number(totalR.toFixed(2)),
    totalProfitUSD: Number(totalProfitUSD.toFixed(2)),
    currentBalance: Number(currentBalance.toFixed(2)),
    targetProfitUSD,
    progressPercent: Number(progressPercent.toFixed(1)),
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    avgScore,
    scoredDaysCount,
    todayR: Number(todayR.toFixed(2)),
    todayUSD: Number(todayUSD.toFixed(2)),
    equityData,
    moodCounts,
  };
}
