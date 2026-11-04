# NRMN2AI Trading OS 📈

سیستم عامل معاملاتی و ژورنال ۶۰ روزه پراپ برای آیفون با چارت زنده، لاگ پوزیشن، مدیریت ریسک و وضعیت روانی.

![NRMN2AI Trading OS](https://api.dicebear.com/7.x/shapes/svg?seed=NRMN2AI&backgroundColor=14171f&shape1Color=00f0ff&shape2Color=a855f7)

## ✨ ویژگی‌ها

- 📱 **رابط کاربری آیفون** - طراحی شبیه iOS با Dynamic Island، Tab Bar و Modalها
- 📊 **ژورنال ۶۰ روزه** - ثبت روزانه معاملات، اهداف، پیش‌بازار و بررسی پایان روز
- 🧠 **مربی هوش مصنوعی (Gemini)** - تحلیل احساسات، روانشناسی معامله و مدیریت ریسک
- 📈 **چارت زنده TradingView** - یکپارچه‌سازی کامل با ویجت TradingView
- 📱 **پشتیبانی PWA / iOS** - قابلیت نصب به عنوان برنامه نیتیو روی آیفون (IPA)
- 🔔 **آلارم معاملاتی** - یادآوری زمان بررسی بازار و اخبار
- 📤 **صادرات/واردات JSON/CSV** - بک‌آپ و ریستور کامل داده‌ها
- 🌙 **تم تیره پیشرفته** - طراحی Neo-morphism با انیمیشن‌های روان

## 🚀 راه‌اندازی محلی

### پیش‌نیازها
- Node.js 20+
- npm یا bun
- کلید API جمینای (Gemini API Key) برای قابلیت مربی هوش مصنوعی

### نصب

```bash
# کلون کردن مخزن
git clone https://github.com/nrmn2ai/nrmn2ai-trading-os.git
cd nrmn2ai-trading-os

# نصب وابستگی‌ها
npm install
# یا
bun install

# تنظیم متغیرهای محیطی
cp .env.example .env.local
# فایل .env.local را ویرایش کرده و GEMINI_API_KEY خود را وارد کنید
```

### اجرای توسعه

```bash
# اجرای سرور توسعه (با Vite + Express برای API)
npm run dev

# یا برای بیلد تولید
npm run build
npm run preview
```

### متغیرهای محیطی

فایل `.env.local` باید شامل موارد زیر باشد:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

## 🏗️ ساخت IPA برای iOS

این پروژه از Capacitor برای بسته‌بندی به عنوان برنامه iOS استفاده می‌کند.

### پیش‌نیازها برای بیلد iOS
- macOS با Xcode نصب شده
- حساب Apple Developer (برای امضای برنامه و نصب روی دستگاه واقعی)

### روش 1: GitHub Actions (پیشنهادی)

مخزن شامل workflow خودکار برای ساخت و انتشار IPA در GitHub Releases است:

1. به تب **Actions** بروید
2. **Build & Release iOS IPA** را انتخاب کنید
3. **Run workflow** را بزنید و تگ نسخه را وارد کنید (مثال: `v1.0.0`)
4. پس از اتمام، فایل IPA در بخش **Releases** موجود است

### روش 2: بیلد محلی

```bash
# نصب Capacitor CLI
npm install -D @capacitor/cli @capacitor/core @capacitor/ios

# بیلد وب
npm run build

# افزودن پلتفرم iOS
npx cap add ios
npx cap sync ios

# باز کردن در Xcode
npx cap open ios
```

در Xcode:
1. Team را در Signing & Capabilities تنظیم کنید
2. Product → Archive
3. Distribute App → Development/Ad Hoc/App Store

## 📁 ساختار پروژه

```
src/
├── components/
│   ├── tabs/           # تب‌های اصلی (Daily, Chart, Strategy, Analytics, Coach, Download)
│   ├── modals/         # ماژول‌ها (AddTrade, Alarm, iOS Install, CSV Import)
│   ├── IPhoneFrame.tsx # فریم آیفون
│   ├── DynamicIsland.tsx
│   ├── Header.tsx
│   ├── TabBar.tsx
│   └── ...
├── utils/
│   ├── storage.ts      # مدیریت localStorage
│   ├── audio.ts        # صداهای سیستم
│   └── ipaExporter.ts  # صادرات IPA
├── types/
│   └── trading.ts      # تایپ‌های TypeScript
├── App.tsx             # کامپوننت اصلی
├── main.tsx            # نقطه ورود
└── index.css           # استایل‌های گلوبال
```

## 🔧 تکنولوژی‌ها

- **React 19** + **TypeScript**
- **Vite 8** برای بیلد سریع
- **Tailwind CSS 4** برای استایل‌دهی
- **Motion (Framer Motion)** برای انیمیشن‌ها
- **Lucide React** برای آیکون‌ها
- **Google GenAI (Gemini)** برای AI Coach
- **Capacitor** برای بسته‌بندی iOS
- **PWA** با Workbox (vite-plugin-pwa)
- **Chart.js** برای نمودارهای Анаلیتیکس
- **TradingView Widget** برای چارت زنده

## 📊 قابلیت‌های ژورنال

### تب روزانه (Daily)
- ثبت وضعیت روانی (۱ تا ۱۰)
- اهداف انضباطی روزانه
- پیش‌بازار (Pre-market analysis)
- لاگ معاملات با Entry/TP/SL/R
- اسکرین‌شات‌های تحلیلی
- امتیازدهی انضباط (۰ تا ۵)
- ثبت ورود خارج از پلن
- بررسی پایان روز (Audit)

### تب استراتژی (Strategy)
- تنظیم پارامترهای پراپ (فاز ۱/۲)
- نمادهای مجاز
- ستاپ‌های تایید شده
- مدیریت ریسک روزانه
- خط قرمزها و پروتکل خروج اضطراری

### تب تحلیل (Analytics)
- منحنی اکویتی (Equity Curve)
- توزیع حالت روانی
- بررسی ۲۰ روزه و ۶۰ روزه
- بهترین ستاپ‌ها و خطاهای تکراری

### مربی هوش مصنوعی (AI Coach)
- گفتگوی تعاملی با Gemini
- تحلیل احساسات معاملات
- راهکارهای کنترل فومو و استرس
- مدیریت ریسک برای پاس کردن پراپ

## 📦 داده‌ها و ذخیره‌سازی

تمام داده‌ها در `localStorage` مرورگر ذخیره می‌شوند:
- `trading-setup` - تنظیمات استراتژی
- `trading-journal-day-{1..60}` - ژورنال هر روز
- `trading-journal-review-{20,40,60}` - بررسی‌های دوره‌ای
- `trading-alarm-time` - زمان آلارم
- `trading-ai-chat-history` - تاریخچه چت AI

### صادرات/واردات
- **JSON**: بک‌آپ کامل تمام ۶۰ روز + تنظیمات
- **CSV**: ورود سریع سود/ضرر به فرمت `SYMBOL,PROFIT`

## 🌐 استقرار (Deployment)

### Vercel / Netlify / Cloudflare Pages
```bash
npm run build
# پوشه dist را استقرار دهید
```

### GitHub Pages
فعال‌سازی GitHub Pages از branch `gh-pages` یا استفاده از Action.

> **نکته**: برای کارکرد AI Coach در تولید، متغیر `GEMINI_API_KEY` باید در محیط استقرار تنظیم شود.

## 🤝 مشارکت

1. Fork کنید
2. Branch جدید بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را Commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request باز کنید

## 📄 مجوز

MIT License - آزاد برای استفاده، تغییر و توزیع.

## 🙏 تشکر

- [Google AI Studio](https://ai.studio) برای پلتفرم توسعه
- [TradingView](https://tradingview.com) برای ویجت چارت
- [Capacitor](https://capacitorjs.com) برای بسته‌بندی نیتیو
- [Vazirmatn Font](https://github.com/rastikerdar/vazirmatn) برای فونت فارسی

---

<div align="center">
<strong>NRMN2AI Trading OS</strong> - ساخته شده با ❤️ برای معامله‌گران پراپ فارسی‌زبان
</div>