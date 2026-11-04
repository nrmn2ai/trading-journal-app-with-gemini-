import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  RefreshCw,
  Cpu,
  BrainCircuit,
  Zap,
  ShieldAlert,
  Smile,
} from 'lucide-react';
import { ChatMessage, DayJournal, SetupConfig } from '../../types/trading';
import { CalculatedStats } from '../../utils/storage';
import { sound } from '../../utils/audio';

interface AiCoachTabProps {
  journal: DayJournal;
  currentDay: number;
  stats: CalculatedStats;
  setup: SetupConfig;
}

export const AiCoachTab: React.FC<AiCoachTabProps> = ({
  journal,
  currentDay,
  stats,
  setup,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('trading-ai-chat-history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [
      {
        id: 'msg-init',
        role: 'assistant',
        content: `سلام معامله‌گر گرامی! 🎯 من مربی هوشمند روانشناسی و مدیریت ریسک NRMN2AI هستم.\n\nامروز در روز ${currentDay} چالش هستید و سود/ضرر روز شما ${stats.todayUSD >= 0 ? '+' : ''}$${stats.todayUSD.toLocaleString()} (${stats.todayR}R) است.\nمی‌توانید درباره تحلیل احساسات معاملات، رفع استرس یا بررسی ستاپ‌ها با من گفتگو کنید.`,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('trading-ai-chat-history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    'تحلیل وضعیت روانی و احساسات معاملات امروز',
    'راهکار کنترل فومو در سشن نیویورک',
    'بررسی ریسک برای پاس کردن فاز ' + setup.propPhase,
    'تکنیک آرام‌سازی ذهن بعد از خوردن استاپ‌لاس',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    sound.playTap();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Build context with current day's trades & sentiments
    const tradeSummary = (journal.trades || [])
      .map(
        (t, idx) =>
          `معامله ${idx + 1}: ${t.symbol} (${t.direction || 'BUY'}) | نتیجه: ${t.r}R | احساس ورود: ${t.sentiment || 'نامشخص'} | یادداشت: ${t.notes || 'ندارد'}`
      )
      .join('\n');

    const systemInstruction = `شما مربی ارشد هوش مصنوعی روانشناسی معاملات و کوچ مدیریت ریسک پراپ فرم برای پلتفرم NRMN2AI هستید.
اطلاعات جاری معامله‌گر:
- حساب پراپ: $${setup.accountSize.toLocaleString()} | فاز: ${setup.propPhase} (تارگت سود: $${(setup.accountSize * (setup.propPhase === '1' ? 0.1 : 0.05)).toLocaleString()})
- روز جاری چالش: روز ${currentDay}
- سود/ضرر امروز: $${stats.todayUSD} (${stats.todayR}R)
- وضعیت روانی خوداظهاری امروز (۱ تا ۱۰): ${journal.emotion || 8}
- نمره انضباط امروز: ${journal.score || 0} از ۵
- معاملات ثبت شده امروز:\n${tradeSummary || 'هنوز معامله‌ای ثبت نشده'}

قوانین رفتار مربی:
۱. پاسخ‌های بسیار تخصصی، انگیزاننده، واقع‌گرایانه و متمرکز بر حفظ سرمایه ارائه دهید.
۲. روی احساسات ثبت‌شده معامله (Confident, Nervous, Bored, Aggressive, Calm, FOMO) تمرکز کنید و اگر حس‌های مخرب دیدید، تذکر دوستانه دهید.
۳. در صورتی که سود امروز به تارگت رسیده، تشویق کنید که چارت را ببندد و دچار طمع نشود.
۴. زبان پاسخ فارسی روان و محترمانه همراه با اصطلاحات رایج انگلیسی دنیای تریدینگ باشد.`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemInstruction,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت پاسخ از مدل جمینای');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'پاسخی دریافت نشد.',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };

      sound.playSuccess();
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'متاسفانه در برقراری ارتباط با مربی هوش مصنوعی خطایی رخ داد. لطفاً مجدداً تلاش کنید.',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    sound.playTap();
    setMessages([
      {
        id: 'msg-init-reset',
        role: 'assistant',
        content: 'تاریخچه گفتگو پاک شد. چطور می‌توانم در روانشناسی یا استراتژی تریدینگ به شما کمک کنم؟',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[720px] pb-24 pt-1 px-3.5 select-none" dir="rtl">
      {/* Top Coach Info & Model Selector */}
      <div className="ios-card-sm p-3 mb-2 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-[#121620] rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-xs text-white">مربی هوش مصنوعی NRMN2AI</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400">تحلیل احساسات، روانشناسی و مدیریت سرمایه</p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
            title="پاکسازی چت"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Model Switcher Segmented Control */}
        <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[10px] font-mono font-medium" dir="ltr">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setSelectedModel('gemini-3.5-flash');
            }}
            className={`py-1 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              selectedModel === 'gemini-3.5-flash'
                ? 'bg-cyan-500 text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>3.5 Flash</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setSelectedModel('gemini-3.1-flash-lite');
            }}
            className={`py-1 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              selectedModel === 'gemini-3.1-flash-lite'
                ? 'bg-cyan-500 text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Flash Lite</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setSelectedModel('gemini-3.1-pro-preview');
            }}
            className={`py-1 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              selectedModel === 'gemini-3.1-pro-preview'
                ? 'bg-cyan-500 text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>3.1 Pro</span>
          </button>
        </div>
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto ios-scrollbar space-y-3 px-1 py-2">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed select-text ${
                  isUser
                    ? 'bg-cyan-500 text-black font-medium rounded-tr-xs shadow-md shadow-cyan-500/10'
                    : 'ios-glass text-slate-100 rounded-tl-xs border border-white/10 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                <span
                  className={`text-[9px] font-mono mt-1 block text-left ${
                    isUser ? 'text-black/60' : 'text-slate-500'
                  }`}
                  dir="ltr"
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
            <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>مربی در حال اندیشیدن و نگارش پاسخ...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-2 shrink-0">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(qp)}
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-[10px] text-slate-300 hover:text-white whitespace-nowrap transition-all ios-btn"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Field Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-1 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="سوالی درباره تریدینگ یا حس‌تان بپرسید..."
          className="ios-input flex-1 p-3 text-xs text-white"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-11 h-11 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 active:scale-95 transition-all ios-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
