import React, { useEffect, useRef } from 'react';

interface Candle {
  x: number;
  open: number;
  close: number;
  high: number;
  low: number;
  width: number;
  isBullish: boolean;
  speed: number;
  waveIndex: number;
}

interface VolumeBar {
  x: number;
  height: number;
  isBullish: boolean;
  speed: number;
}

interface CandlestickMotionBackgroundProps {
  insideFrame?: boolean;
}

export const CandlestickMotionBackground: React.FC<CandlestickMotionBackgroundProps> = ({
  insideFrame = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const getDimensions = () => {
      const parent = canvas.parentElement;
      const w = insideFrame && parent && parent.clientWidth > 0 ? parent.clientWidth : (insideFrame ? 375 : window.innerWidth);
      const h = insideFrame && parent && parent.clientHeight > 0 ? parent.clientHeight : (insideFrame ? 824 : window.innerHeight);
      return { w, h };
    };

    let { w: width, h: height } = getDimensions();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setupCanvasSize = () => {
      const dims = getDimensions();
      width = dims.w;
      height = dims.h;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupCanvasSize();

    // Create 2 distinct candlestick tracks/waves to cover both top & bottom halves of the screen
    const candleWidth = insideFrame ? 7 : 9;
    const candleSpacing = insideFrame ? 13 : 16;
    const numCandlesPerTrack = Math.ceil(width / candleSpacing) + 16;

    const candles: Candle[] = [];
    const volumeBars: VolumeBar[] = [];

    // Track 1: Mid-Upper Stream (30% to 52% of height)
    let price1 = height * 0.42;
    for (let i = 0; i < numCandlesPerTrack; i++) {
      const delta = (Math.random() - 0.48) * (height * 0.06);
      const open = Math.max(height * 0.22, Math.min(height * 0.52, price1));
      const close = Math.max(height * 0.22, Math.min(height * 0.52, open + delta));
      const high = Math.max(open, close) + Math.random() * (height * 0.035);
      const low = Math.min(open, close) - Math.random() * (height * 0.035);
      const isBullish = close >= open;

      candles.push({
        x: i * candleSpacing,
        open,
        close,
        high,
        low,
        width: candleWidth,
        isBullish,
        speed: 0.65,
        waveIndex: 1,
      });

      price1 = close;
    }

    // Track 2: Lower Stream (65% to 84% of height) - keeps motion visible even when scrolling down!
    let price2 = height * 0.74;
    for (let i = 0; i < numCandlesPerTrack; i++) {
      const delta = (Math.random() - 0.48) * (height * 0.05);
      const open = Math.max(height * 0.60, Math.min(height * 0.85, price2));
      const close = Math.max(height * 0.60, Math.min(height * 0.85, open + delta));
      const high = Math.max(open, close) + Math.random() * (height * 0.03);
      const low = Math.min(open, close) - Math.random() * (height * 0.03);
      const isBullish = close >= open;

      candles.push({
        x: i * candleSpacing,
        open,
        close,
        high,
        low,
        width: candleWidth,
        isBullish,
        speed: 0.55,
        waveIndex: 2,
      });

      price2 = close;

      // Bottom Volume Bar
      volumeBars.push({
        x: i * candleSpacing,
        height: Math.random() * (height * 0.08) + 6,
        isBullish,
        speed: 0.65,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      // 1. Subtle Trading Grid Lines (horizontal & vertical)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const stepY = insideFrame ? 55 : 70;
      for (let y = 0; y < height; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Glowing Moving Average Lines (EMA)
      // Wave 1 EMA line
      ctx.save();
      ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.38)';
      ctx.lineWidth = 1.8;
      for (let x = 0; x <= width; x += 12) {
        const y =
          height * 0.38 +
          Math.sin(x * 0.012 + time) * (height * 0.06) +
          Math.cos(x * 0.02 + time * 0.7) * (height * 0.03);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Wave 2 EMA line
      ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.32)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= width; x += 12) {
        const y =
          height * 0.72 +
          Math.cos(x * 0.014 - time * 0.8) * (height * 0.05) +
          Math.sin(x * 0.022 + time * 0.5) * (height * 0.025);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // 3. Render Volume Bars at the bottom
      const bottomBaseY = height - (insideFrame ? 25 : 15);
      for (let i = 0; i < volumeBars.length; i++) {
        const v = volumeBars[i];
        v.x -= v.speed;
        if (v.x + candleWidth < -20) {
          const maxVolX = Math.max(...volumeBars.map((b) => b.x));
          v.x = maxVolX + candleSpacing;
          v.height = Math.random() * (height * 0.08) + 6;
          v.isBullish = Math.random() > 0.48;
        }

        ctx.fillStyle = v.isBullish ? 'rgba(0, 240, 255, 0.22)' : 'rgba(244, 63, 94, 0.18)';
        ctx.fillRect(v.x, bottomBaseY - v.height, candleWidth, v.height);
      }

      // 4. Render & Animate Candlesticks (Vibrant & Glowing)
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        c.x -= c.speed; // Drift from right to left

        // Reset candle when off screen
        if (c.x + c.width < -30) {
          const sameTrack = candles.filter((item) => item.waveIndex === c.waveIndex);
          const rightMostX = Math.max(...sameTrack.map((item) => item.x));
          c.x = rightMostX + candleSpacing;

          const lastInTrack = sameTrack[(i + sameTrack.length - 1) % sameTrack.length];
          const delta = (Math.random() - 0.48) * (height * 0.06);

          if (c.waveIndex === 1) {
            c.open = lastInTrack.close;
            c.close = Math.max(height * 0.20, Math.min(height * 0.54, c.open + delta));
            c.high = Math.max(c.open, c.close) + Math.random() * (height * 0.035);
            c.low = Math.min(c.open, c.close) - Math.random() * (height * 0.035);
          } else {
            c.open = lastInTrack.close;
            c.close = Math.max(height * 0.58, Math.min(height * 0.86, c.open + delta));
            c.high = Math.max(c.open, c.close) + Math.random() * (height * 0.03);
            c.low = Math.min(c.open, c.close) - Math.random() * (height * 0.03);
          }
          c.isBullish = c.close >= c.open;
        }

        const top = Math.min(c.open, c.close);
        const bodyHeight = Math.max(4, Math.abs(c.close - c.open));
        const centerX = c.x + c.width / 2;

        ctx.save();
        if (c.isBullish) {
          // Neon Cyan / Emerald Bullish Candle
          ctx.shadowColor = 'rgba(0, 240, 255, 0.55)';
          ctx.shadowBlur = 5;
          ctx.fillStyle = 'rgba(0, 240, 255, 0.70)';
          ctx.strokeStyle = '#00f0ff';
        } else {
          // Neon Rose / Red Bearish Candle
          ctx.shadowColor = 'rgba(244, 63, 94, 0.55)';
          ctx.shadowBlur = 5;
          ctx.fillStyle = 'rgba(244, 63, 94, 0.65)';
          ctx.strokeStyle = '#f43f5e';
        }

        // Wick Line
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(centerX, c.high);
        ctx.lineTo(centerX, c.low);
        ctx.stroke();

        // Candle Body
        ctx.fillRect(c.x, top, c.width, bodyHeight);
        ctx.strokeRect(c.x, top, c.width, bodyHeight);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      setupCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => {
      setupCanvasSize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [insideFrame]);

  return (
    <canvas
      ref={canvasRef}
      className={`${
        insideFrame ? 'absolute inset-0 w-full h-full' : 'fixed inset-0 w-screen h-screen'
      } pointer-events-none z-0`}
      style={{
        opacity: insideFrame ? 0.90 : 0.70,
      }}
    />
  );
};
