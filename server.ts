import { GoogleGenAI } from '@google/genai';
import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, model = 'gemini-3.5-flash' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const contents = messages.map((m: { role: string; content?: string; text?: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }],
    }));

    const response = await ai.models.generateContent({
      model: model || 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction:
          systemInstruction ||
          'شما یک مربی ارشد روانشناسی معاملات و مدیر ریسک پراپ فرم برای پلتفرم معاملاتی NRMN2AI هستید. شما به معامله‌گران کمک می‌کنید احساسات لحظه ورود (Confident, Nervous, Bored, Aggressive, Calm, FOMO) را تحلیل کنند، به حد ضرر پایبند باشند و چالش‌های پراپ $200k را با انضباط پاس کنند. پاسخ‌ها را به زبان فارسی روان و با اصطلاحات تخصصی انگلیسی تریدینگ ارائه دهید.',
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Error communicating with Gemini' });
  }
});

// Direct file download endpoints for GitHub sync
app.get('/package-lock.json', (_req, res) => {
  res.download('package-lock.json', 'package-lock.json');
});

app.get('/package.json', (_req, res) => {
  res.download('package.json', 'package.json');
});

app.get('/vite.config.ts', (_req, res) => {
  res.download('vite.config.ts', 'vite.config.ts');
});

app.get('/capacitor.config.json', (_req, res) => {
  res.download('capacitor.config.json', 'capacitor.config.json');
});

app.get('/deploy-ipa-release.yml', (_req, res) => {
  res.download('.github/workflows/deploy-ipa-release.yml', 'deploy-ipa-release.yml');
});

async function start() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(
      express.static('dist', {
        setHeaders: (res, filePath) => {
          if (
            filePath.endsWith('index.html') ||
            filePath.endsWith('sw.js') ||
            filePath.endsWith('registerSW.js') ||
            filePath.endsWith('manifest.webmanifest')
          ) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`NRMN2AI Server running on http://localhost:${PORT}`);
  });
}

start();
