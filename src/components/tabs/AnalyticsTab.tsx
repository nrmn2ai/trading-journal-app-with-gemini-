import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Target,
  BarChart2,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Tag,
  Filter,
} from 'lucide-react';
import { SetupConfig, ReviewData, TradeItem } from '../../types/trading';
import { CalculatedStats, getDayJournal } from '../../utils/storage';
import { sound } from '../../utils/audio';

interface AnalyticsTabProps {
  stats: CalculatedStats;
  setup: SetupConfig;
  review: ReviewData;
  onChangeReview: (review: ReviewData) => void;
  onOpenCsvModal: () => void;
  onExportJson: () => void;
}

interface TradeWithDay extends TradeItem {
  day: number;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  stats,
  setup,
  review,
  onChangeReview,
  onOpenCsvModal,
  onExportJson,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<{ day: number; r: number } | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');

  // Collect all trades across the 60 days
  const allTrades = useMemo(() => {
    const list: TradeWithDay[] = [];
    for (let day = 1; day <= 60; day++) {
      const dayData = getDayJournal(day);
      (dayData.trades || []).forEach((t) => {
        list.push({ ...t, day });
      });
    }
    return list;
  }, []);

  // Compute tag statistics
  const tagStats = useMemo(() => {
    const categoryMap: Record<string, { count: number; wins: number; totalR: number }> = {};
    const defaultTags = ['#scalp', '#swing', '#news', '#reversal', '#breakout', '#trend'];

    defaultTags.forEach((t) => {
      categoryMap[t] = { count: 0, wins: 0, totalR: 0 };
    });

    allTrades.forEach((t) => {
      const tags = t.tags && t.tags.length > 0 ? t.tags : ['بدون تگ'];
      tags.forEach((tag) => {
        if (!categoryMap[tag]) {
          categoryMap[tag] = { count: 0, wins: 0, totalR: 0 };
        }
        categoryMap[tag].count++;
        if (t.r > 0) categoryMap[tag].wins++;
        categoryMap[tag].totalR += t.r;
      });
    });

    return Object.entries(categoryMap).map(([tag, data]) => ({
      tag,
      count: data.count,
      totalR: Number(data.totalR.toFixed(2)),
      profitUSD: Number((data.totalR * setup.riskValue).toFixed(2)),
      winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
    }));
  }, [allTrades, setup.riskValue]);

  // Filtered trades by selected tag
  const filteredTrades = useMemo(() => {
    if (selectedTagFilter === 'ALL') return allTrades;
    return allTrades.filter((t) => t.tags && t.tags.includes(selectedTagFilter));
  }, [allTrades, selectedTagFilter]);

  // Filtered stats
  const filteredMetrics = useMemo(() => {
    let rSum = 0;
    let winCount = 0;
    filteredTrades.forEach((t) => {
      rSum += t.r;
      if (t.r > 0) winCount++;
    });
    return {
      count: filteredTrades.length,
      totalR: Number(rSum.toFixed(2)),
      profitUSD: Number((rSum * setup.riskValue).toFixed(2)),
      winRate: filteredTrades.length > 0 ? Math.round((winCount / filteredTrades.length) * 100) : 0,
    };
  }, [filteredTrades, setup.riskValue]);

  // Build SVG Points for Equity Curve
  const maxR = Math.max(5, ...stats.equityData);
  const minR = Math.min(-2, ...stats.equityData);
  const rangeR = maxR - minR || 1;

  const svgWidth = 340;
  const svgHeight = 150;
  const paddingX = 15;
  const paddingY = 20;

  const points = stats.equityData.map((val: number, idx: number) => {
    const x = paddingX + (idx / Math.max(1, stats.equityData.length - 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - ((val - minR) / rangeR) * (svgHeight - 2 * paddingY);
    return { x, y, val, day: idx };
  });

  const pathD = points.reduce((acc: string, pt: { x: number; y: number }, i: number) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  const maxMoodCount = Math.max(1, ...stats.moodCounts);
  const moodColors = [
    '#f43f5e', '#fb7185', '#fb923c', '#fbbf24', '#facc15',
    '#a3e635', '#4ade80', '#22c55e', '#10b981', '#06b6d4'
  ];

  return (
    <div className="space-y-4 pb-24 pt-2 px-3.5 select-none" dir="rtl">
      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Account Balance */}
        <div className="ios-card-sm p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">موجودی کل حساب</span>
          <div className="mt-1">
            <span className="text-lg font-black font-mono text-white block" dir="ltr">
              ${stats.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5" dir="ltr">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total R */}
        <div className="ios-card-sm p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">سود خالص (Net R)</span>
          <div className="mt-1">
            <span className={`text-lg font-black font-mono block ${stats.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
              {stats.totalR >= 0 ? '+' : ''}{stats.totalR}R
            </span>
            <span className="text-[10px] text-slate-400 font-mono block" dir="ltr">
              {stats.totalProfitUSD >= 0 ? '+' : ''}${stats.totalProfitUSD.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="ios-card-sm p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">وین‌ریت (Win Rate)</span>
          <div className="mt-1">
            <span className="text-lg font-black font-mono text-amber-400 block" dir="ltr">
              {stats.winRate}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              {stats.totalTrades} معامله ثبت شده
            </span>
          </div>
        </div>

        {/* Discipline Index */}
        <div className="ios-card-sm p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">شاخص انضباط</span>
          <div className="mt-1">
            <span className="text-lg font-black font-mono text-purple-400 block" dir="ltr">
              {stats.avgScore} / ۵.۰
            </span>
            <span className="text-[10px] text-slate-400 block">
              {stats.scoredDaysCount} روز ارزیابی شده
            </span>
          </div>
        </div>
      </div>

      {/* Trade Tag Filtering & Category Performance Breakdown */}
      <div className="ios-card p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white">فیلتر و تحلیل دسته‌بندی‌ها (Strategy Tags)</h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredTrades.length} معامله در این فیلتر
          </span>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1" dir="ltr">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setSelectedTagFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold shrink-0 transition-all ios-btn ${
              selectedTagFilter === 'ALL'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            #ALL (همه)
          </button>

          {['#scalp', '#swing', '#news', '#reversal', '#breakout', '#trend'].map((tag) => {
            const isSelected = selectedTagFilter === tag;
            const countForTag = allTrades.filter((t) => t.tags && t.tags.includes(tag)).length;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  sound.playTap();
                  setSelectedTagFilter(tag);
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ios-btn ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{tag}</span>
                <span className="text-[10px] opacity-70">({countForTag})</span>
              </button>
            );
          })}
        </div>

        {/* Filtered Metric Banner if a specific tag is selected */}
        {selectedTagFilter !== 'ALL' && (
          <div className="ios-inset p-3 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 font-mono" dir="ltr">
                نتایج استراتژی {selectedTagFilter}:
              </span>
              <span className={`text-xs font-mono font-bold ${filteredMetrics.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
                {filteredMetrics.totalR >= 0 ? '+' : ''}{filteredMetrics.totalR}R ({filteredMetrics.profitUSD >= 0 ? '+' : ''}${filteredMetrics.profitUSD.toLocaleString()})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs" dir="ltr">
              <div className="bg-black/30 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-sans">تعداد معامله</span>
                <span className="font-mono font-bold text-white">{filteredMetrics.count}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-sans">وین‌ریت</span>
                <span className="font-mono font-bold text-amber-400">{filteredMetrics.winRate}%</span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-sans">میانگین R</span>
                <span className="font-mono font-bold text-cyan-300">
                  {filteredMetrics.count > 0 ? (filteredMetrics.totalR / filteredMetrics.count).toFixed(2) : '0'}R
                </span>
              </div>
            </div>

            {/* List of trades for this tag */}
            {filteredTrades.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 block">معاملات ثبت‌شده با این تگ:</span>
                <div className="max-h-36 overflow-y-auto ios-scrollbar space-y-1">
                  {filteredTrades.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-[11px] font-mono"
                      dir="ltr"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Day {t.day}</span>
                        <span className="font-bold text-white">{t.symbol}</span>
                        {t.sentiment && (
                          <span className="text-[9px] text-cyan-400 px-1 rounded bg-cyan-500/10">
                            {t.sentiment}
                          </span>
                        )}
                      </div>
                      <span className={`font-bold ${t.r >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.r >= 0 ? '+' : ''}{t.r}R
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Performance Breakdown Grid */}
        {selectedTagFilter === 'ALL' && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium block">
              مقایسه بازدهی سبک‌ها (Category Breakdown):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {tagStats
                .filter((item) => item.count > 0)
                .map((item) => (
                  <div
                    key={item.tag}
                    onClick={() => {
                      sound.playTap();
                      setSelectedTagFilter(item.tag);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all ios-btn flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-300" dir="ltr">
                        {item.tag}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.count} ترید
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1.5" dir="ltr">
                      <span className="text-[10px] font-mono text-amber-400">
                        WR: {item.winRate}%
                      </span>
                      <span className={`text-xs font-mono font-bold ${item.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.totalR >= 0 ? '+' : ''}{item.totalR}R
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Equity Curve Chart (SVG) */}
      <div className="ios-card p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">منحنی رشد سرمایه (Equity Curve R)</span>
          </div>
          {activeTooltip ? (
            <span className="text-[11px] font-mono text-cyan-300 font-bold" dir="ltr">
              Day {activeTooltip.day}: {activeTooltip.r}R
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-400">لمس جهت جزئیات</span>
          )}
        </div>

        <div className="w-full bg-[#0d1017] rounded-2xl p-2 border border-white/5 relative overflow-hidden" dir="ltr">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-40 overflow-visible"
          >
            <defs>
              <linearGradient id="equityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="rgba(255,255,255,0.08)" />

            {/* Filled Area */}
            {areaD && <path d={areaD} fill="url(#equityGrad)" />}

            {/* Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data points */}
            {points.map((pt: { x: number; y: number; val: number; day: number }, idx: number) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={activeTooltip?.day === pt.day ? 5 : 2}
                fill="#00f0ff"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setActiveTooltip({ day: pt.day, r: pt.val })}
                onClick={() => {
                  sound.playTap();
                  setActiveTooltip({ day: pt.day, r: pt.val });
                }}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Psychological Mood Distribution Histogram */}
      <div className="ios-card p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white">توزیع وضعیت روانی در ۶۰ روز</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">طیف آرامش (۱ تا ۱۰)</span>
        </div>

        <div className="bg-[#0d1017] rounded-2xl p-3 border border-white/5 space-y-2" dir="ltr">
          <div className="grid grid-cols-10 gap-1.5 items-end h-28 pt-2">
            {stats.moodCounts.map((count: number, idx: number) => (
              <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] font-mono text-slate-400">{count > 0 ? count : ''}</span>
                <div
                  className="w-full rounded-t-md transition-all duration-300"
                  style={{
                    height: `${Math.max(8, (count / maxMoodCount) * 100)}%`,
                    backgroundColor: moodColors[idx],
                  }}
                />
                <span className="text-[10px] font-mono font-bold text-slate-300">{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 20-Day Block Assessment */}
      <div className="ios-card p-3.5 space-y-3 border-r-4 border-purple-500">
        <div>
          <h4 className="text-xs font-bold text-purple-400">بررسی داده‌های دوره‌ای (بلوک ۲۰ روزه)</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">شناسایی الگوهای تکراری و تله‌های روانی</p>
        </div>

        <div>
          <label className="block text-[11px] text-slate-300 mb-1">بهترین ستاپ تایید شده با دیتای شما:</label>
          <textarea
            value={review.best}
            onChange={(e) => onChangeReview({ ...review, best: e.target.value })}
            className="ios-input w-full p-2.5 h-16 text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-300 mb-1">خطاهای تکراری و تله‌های احساسی:</label>
          <textarea
            value={review.error}
            onChange={(e) => onChangeReview({ ...review, error: e.target.value })}
            className="ios-input w-full p-2.5 h-16 text-xs"
          />
        </div>
      </div>

      {/* 60-Day Complete Cycle Reflection */}
      <div className="ios-card p-3.5 space-y-3 border-r-4 border-amber-400">
        <div>
          <h4 className="text-xs font-bold text-amber-400">چرخه کامل ۶۰ روزه و تصمیم راهبردی</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">تحول ذهنیت و ورود به مرحله بعدی</p>
        </div>

        <div>
          <label className="block text-[11px] text-slate-300 mb-1">تغییر الگو (Paradigm Shift) در روانشناسی:</label>
          <textarea
            value={review.behavior}
            onChange={(e) => onChangeReview({ ...review, behavior: e.target.value })}
            className="ios-input w-full p-2.5 h-16 text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-300 mb-1">تصمیم برای گام بعدی:</label>
          <textarea
            value={review.next}
            onChange={(e) => onChangeReview({ ...review, next: e.target.value })}
            placeholder="شروع حساب ریل پراپ، افزایش ریسک در هر پوزیشن..."
            className="ios-input w-full p-2.5 h-16 text-xs"
          />
        </div>
      </div>

      {/* Sync Tools */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => {
            sound.playSuccess();
            onExportJson();
          }}
          className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 ios-btn"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          دانلود پشتیبان
        </button>

        <button
          onClick={() => {
            sound.playTap();
            onOpenCsvModal();
          }}
          className="py-2.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 ios-btn"
        >
          <Upload className="w-3.5 h-3.5" />
          ورود CSV یا JSON
        </button>
      </div>
    </div>
  );
};
