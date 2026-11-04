/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { IPhoneFrame } from './components/IPhoneFrame';
import { DynamicIsland } from './components/DynamicIsland';
import { Header } from './components/Header';
import { TabBar, TabKey } from './components/TabBar';
import { DailyTab } from './components/tabs/DailyTab';
import { ChartTab } from './components/tabs/ChartTab';
import { StrategyTab } from './components/tabs/StrategyTab';
import { AnalyticsTab } from './components/tabs/AnalyticsTab';
import { AiCoachTab } from './components/tabs/AiCoachTab';
import { DownloadTab } from './components/tabs/DownloadTab';
import { AddTradeModal } from './components/modals/AddTradeModal';
import { AlarmModal } from './components/modals/AlarmModal';
import { IOSInstallModal } from './components/modals/IOSInstallModal';
import { CsvImportModal } from './components/modals/CsvImportModal';
import {
  initializeSeedData,
  getSetup,
  saveSetup,
  getDayJournal,
  saveDayJournal,
  getReview,
  saveReview,
  calculateAllStats,
} from './utils/storage';
import { TradeItem, SetupConfig, DayJournal, ReviewData } from './types/trading';
import { sound } from './utils/audio';
import { CheckCircle, Trophy, X } from 'lucide-react';

export default function App() {
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const [setup, setSetup] = useState<SetupConfig>(getSetup());
  const [journal, setJournal] = useState<DayJournal>(getDayJournal(1));
  const [review, setReview] = useState<ReviewData>(getReview(1));
  const [stats, setStats] = useState(calculateAllStats(1, setup));
  const [alarmTime, setAlarmTime] = useState<string>('');
  const [goalCelebration, setGoalCelebration] = useState<boolean>(false);

  // Modals
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [installModalTab, setInstallModalTab] = useState<'download_ipa' | 'github_sync' | 'pwa_safari' | 'sideload_guide'>('download_ipa');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const handleOpenInstallModal = (tab: 'download_ipa' | 'github_sync' | 'pwa_safari' | 'sideload_guide' = 'download_ipa') => {
    setInstallModalTab(tab);
    setIsInstallModalOpen(true);
  };

  // Initialize data on mount
  useEffect(() => {
    initializeSeedData();
    const loadedSetup = getSetup();
    setSetup(loadedSetup);
    const loadedJournal = getDayJournal(1);
    setJournal(loadedJournal);
    setReview(getReview(1));
    setStats(calculateAllStats(1, loadedSetup));

    const savedAlarm = localStorage.getItem('trading-alarm-time');
    if (savedAlarm) setAlarmTime(savedAlarm);
  }, []);

  // Recalculate stats whenever currentDay, journal, or setup changes
  const refreshStats = useCallback(
    (day: number, s: SetupConfig) => {
      setStats(calculateAllStats(day, s));
    },
    []
  );

  // Switch day
  const handleSelectDay = (day: number) => {
    setCurrentDay(day);
    const loadedJournal = getDayJournal(day);
    setJournal(loadedJournal);
    const loadedReview = getReview(day);
    setReview(loadedReview);
    refreshStats(day, setup);

    // If day is a multiple of 20, automatically suggest review tab
    if (day % 20 === 0 && activeTab === 'daily') {
      setActiveTab('analytics');
    }
  };

  // Change journal
  const handleChangeJournal = (updated: DayJournal) => {
    setJournal(updated);
    saveDayJournal(currentDay, updated);
    refreshStats(currentDay, setup);
  };

  // Change setup
  const handleChangeSetup = (updated: SetupConfig) => {
    setSetup(updated);
    saveSetup(updated);
    refreshStats(currentDay, updated);
  };

  // Change review
  const handleChangeReview = (updated: ReviewData) => {
    setReview(updated);
    saveReview(currentDay, updated);
  };

  // Save a new trade
  const handleSaveTrade = (newTrade: TradeItem) => {
    const updatedTrades = [newTrade, ...(journal.trades || [])];
    const updatedJournal = { ...journal, trades: updatedTrades };
    handleChangeJournal(updatedJournal);

    // Check if daily profit reached goal
    const newStats = calculateAllStats(currentDay, setup);
    if (newStats.todayUSD >= 300) {
      setGoalCelebration(true);
      sound.speakGoalReached(newStats.todayUSD);
    }
  };

  // Check goal audio celebration
  const handleCheckDailyGoal = () => {
    sound.speakGoalReached(stats.todayUSD);
    setGoalCelebration(true);
  };

  // Alarm timer runner
  useEffect(() => {
    if (!alarmTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (currentStr === alarmTime && now.getSeconds() === 0) {
        sound.playAlarmTone();
        // Browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('NRMN2AI Alarm', {
            body: `زمان شروع بررسی سشن یا اخبار: ${alarmTime}`,
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarmTime]);

  const handleSetAlarm = (time: string) => {
    setAlarmTime(time);
    if (time) {
      localStorage.setItem('trading-alarm-time', time);
    } else {
      localStorage.removeItem('trading-alarm-time');
    }
  };

  // CSV Import
  const handleImportCsvText = (text: string) => {
    const lines = text.split('\n');
    const newTrades: TradeItem[] = [];

    lines.forEach((line) => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        const sym = parts[0].trim().toUpperCase();
        const pnl = parseFloat(parts[1]);
        if (sym && !isNaN(pnl)) {
          const rValue = Number((pnl / (setup.riskValue || 1000)).toFixed(2));
          newTrades.push({
            id: `trade-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            symbol: sym,
            entry: '',
            tp: '',
            sl: '',
            r: rValue,
            direction: pnl >= 0 ? 'BUY' : 'SELL',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          });
        }
      }
    });

    if (newTrades.length > 0) {
      const updatedJournal = {
        ...journal,
        trades: [...newTrades, ...(journal.trades || [])],
      };
      handleChangeJournal(updatedJournal);
      sound.playSuccess();
    }
  };

  // JSON Export
  const handleExportJson = () => {
    const data: Record<string, unknown> = {};
    for (let i = 1; i <= 60; i++) {
      data[`day-${i}`] = localStorage.getItem(`trading-journal-day-${i}`);
      data[`review-${i}`] = localStorage.getItem(`trading-journal-review-${i}`);
    }
    data['setup'] = localStorage.getItem('trading-setup');
    data['alarm'] = localStorage.getItem('trading-alarm-time');

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NRMN2AI_iPhone_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON Import
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.keys(data).forEach((key) => {
          if (data[key]) {
            if (key === 'setup') localStorage.setItem('trading-setup', String(data[key]));
            else if (key === 'alarm') localStorage.setItem('trading-alarm-time', String(data[key]));
            else localStorage.setItem(`trading-journal-${key}`, String(data[key]));
          }
        });
        sound.playSuccess();
        window.location.reload();
      } catch (err) {
        alert('فایل JSON معتبر نیست.');
      }
    };
    reader.readAsText(file);
  };

  // Full reset
  const handleResetAll = () => {
    localStorage.clear();
    sound.playTap();
    window.location.reload();
  };

  return (
    <IPhoneFrame onOpenInstallModal={handleOpenInstallModal}>
      {/* Top Dynamic Island */}
      <DynamicIsland
        stats={stats}
        setup={setup}
        currentDay={currentDay}
        alarmTime={alarmTime}
        onOpenTradeModal={() => setIsTradeModalOpen(true)}
        onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
      />

      {/* iOS App Navigation Header */}
      <Header
        stats={stats}
        setup={setup}
        alarmTime={alarmTime}
        onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
        onOpenInstallModal={() => handleOpenInstallModal('download_ipa')}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onExportData={handleExportJson}
      />

      {/* Goal Celebration Toast / Banner */}
      {goalCelebration && (
        <div className="mx-3.5 my-2 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 border border-emerald-500/30 flex items-center justify-between gap-2 animate-bounce select-none">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold text-emerald-300 block">هدف روزانه محقق شد! 🏆</span>
              <span className="text-[11px] text-slate-300">سود امروز: +${stats.todayUSD.toLocaleString()} (${stats.todayR}R)</span>
            </div>
          </div>
          <button
            onClick={() => setGoalCelebration(false)}
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 overflow-y-auto pb-28">
        {activeTab === 'daily' && (
          <DailyTab
            currentDay={currentDay}
            onSelectDay={handleSelectDay}
            journal={journal}
            onChangeJournal={handleChangeJournal}
            stats={stats}
            setup={setup}
            onOpenTradeModal={() => setIsTradeModalOpen(true)}
            onCheckDailyGoal={handleCheckDailyGoal}
            onOpenInstallModal={handleOpenInstallModal}
          />
        )}

        {activeTab === 'chart' && <ChartTab />}

        {activeTab === 'strategy' && (
          <StrategyTab
            setup={setup}
            onChangeSetup={handleChangeSetup}
            onOpenInstallModal={() => handleOpenInstallModal('download_ipa')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            stats={stats}
            setup={setup}
            review={review}
            onChangeReview={handleChangeReview}
            onOpenCsvModal={() => setIsCsvModalOpen(true)}
            onExportJson={handleExportJson}
          />
        )}

        {activeTab === 'coach' && (
          <AiCoachTab
            journal={journal}
            currentDay={currentDay}
            stats={stats}
            setup={setup}
          />
        )}

        {activeTab === 'download' && <DownloadTab />}
      </main>

      {/* Fixed Bottom iOS Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        todayTradeCount={journal.trades?.length || 0}
      />

      {/* Modals */}
      <AddTradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        onSaveTrade={handleSaveTrade}
        riskValue={setup.riskValue}
      />

      <AlarmModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        alarmTime={alarmTime}
        onSetAlarm={handleSetAlarm}
      />

      <IOSInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        defaultTab={installModalTab}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportCsvText={handleImportCsvText}
        onImportJsonFile={handleImportJsonFile}
        onExportJson={handleExportJson}
        onResetAll={handleResetAll}
      />
    </IPhoneFrame>
  );
}
