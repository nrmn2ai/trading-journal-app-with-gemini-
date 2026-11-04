import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, ExternalLink, RefreshCw, BarChart2 } from 'lucide-react';
import { sound } from '../../utils/audio';

export const ChartTab: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [symbol, setSymbol] = useState('OANDA:EURUSD');
  const [interval, setInterval] = useState('15');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const widgetId = 'tradingview_iphone_widget';

  const symbolsList = [
    { label: 'EUR/USD', tv: 'OANDA:EURUSD' },
    { label: 'طلا (XAU)', tv: 'OANDA:XAUUSD' },
    { label: 'BTC', tv: 'BINANCE:BTCUSDT' },
    { label: 'GBP/USD', tv: 'OANDA:GBPUSD' },
    { label: 'NASDAQ', tv: 'CAPITALCOM:US100' },
    { label: 'DOW (US30)', tv: 'CAPITALCOM:US30' },
  ];

  const intervalsList = [
    { label: '1m', val: '1' },
    { label: '5m', val: '5' },
    { label: '15m', val: '15' },
    { label: '1h', val: '60' },
    { label: '4h', val: '240' },
    { label: '1D', val: 'D' },
  ];

  const initWidget = () => {
    if (typeof window === 'undefined') return;

    // Check if TradingView script is available
    const tv = (window as unknown as { TradingView?: { widget: new (options: unknown) => unknown } }).TradingView;
    if (tv) {
      new tv.widget({
        autosize: true,
        symbol: symbol,
        interval: interval,
        timezone: 'Asia/Tehran',
        theme: 'dark',
        style: '1',
        locale: 'fa_IR',
        enable_publishing: false,
        backgroundColor: '#0c0f16',
        gridColor: '#161b28',
        hide_top_toolbar: false,
        allow_symbol_change: true,
        hide_legend: false,
        save_image: true,
        container_id: widgetId,
        toolbar_bg: '#0c0f16',
      });
    }
  };

  useEffect(() => {
    initWidget();
  }, [symbol, interval]);

  const handleSelectSymbol = (s: string) => {
    sound.playTap();
    setSymbol(s);
  };

  const handleSelectInterval = (inv: string) => {
    sound.playTap();
    setInterval(inv);
  };

  return (
    <div className={`space-y-3 pb-24 pt-2 px-3.5 select-none ${isFullscreen ? 'fixed inset-0 z-50 bg-[#0a0d14] p-2 pb-6' : ''}`} dir="rtl">
      {/* Quick Watchlist Selector */}
      <div className="ios-card-sm p-2 flex items-center justify-between gap-1 overflow-x-auto hide-scrollbar" dir="ltr">
        <div className="flex items-center gap-1.5 shrink-0">
          {symbolsList.map((item) => (
            <button
              key={item.tv}
              onClick={() => handleSelectSymbol(item.tv)}
              className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all ios-btn whitespace-nowrap ${
                symbol === item.tv
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeframe Chips & Fullscreen */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1 font-mono" dir="ltr">
          {intervalsList.map((item) => (
            <button
              key={item.val}
              onClick={() => handleSelectInterval(item.val)}
              className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ios-btn ${
                interval === item.val
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playTap();
              initWidget();
            }}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300"
            title="بازنشانی چارت"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setIsFullscreen(!isFullscreen);
            }}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300"
            title={isFullscreen ? 'خروج از تمام صفحه' : 'تمام صفحه چارت'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* TradingView Container */}
      <div
        ref={containerRef}
        className={`w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0c0f16] shadow-xl ${
          isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[520px]'
        }`}
        dir="ltr"
      >
        <div id={widgetId} className="w-full h-full" />
      </div>

      {/* Touch Trading Tip */}
      <div className="text-[10px] text-slate-500 text-center">
        💡 نکته: با لمس دو انگشت می‌توانید چارت را زوم کنید یا مستقیماً در تریدینگ‌ویو لاگین نمایید.
      </div>
    </div>
  );
};
