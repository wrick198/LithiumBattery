import React, { useEffect, useRef } from 'react';
import { LithiumConfig } from '../types';
import { BatteryCharging, Zap } from 'lucide-react';

interface LithiumBatteryProps {
  config: LithiumConfig;
  chargeLevel: number;
  isActive: boolean; // Discharging
  isCharging: boolean;
}

export const LithiumBattery: React.FC<LithiumBatteryProps> = ({ config, chargeLevel, isActive, isCharging }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle animation logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; speed: number; size: number }[] = [];
    
    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        size: 2 + Math.random() * 3
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Battery Container
      const w = canvas.width;
      const h = canvas.height;
      const anodeWidth = w * 0.35;
      const cathodeWidth = w * 0.35;
      const sepWidth = w * 0.3;

      // Anode (Negative) - Graphite - Left
      ctx.fillStyle = '#334155'; // Slate 700
      ctx.fillRect(0, 0, anodeWidth, h);
      ctx.fillStyle = '#94a3b8';
      ctx.font = "bold 16px 'Noto Serif SC', sans-serif";
      ctx.fillText("负极 (石墨)", 20, 40);

      // Cathode (Positive) - Metal Oxide - Right
      ctx.fillStyle = '#0f766e'; // Teal 700
      ctx.fillRect(w - cathodeWidth, 0, cathodeWidth, h);
      ctx.fillStyle = '#5eead4';
      ctx.font = "bold 16px 'Noto Serif SC', sans-serif";
      ctx.fillText("正极 (氧化物)", w - cathodeWidth + 20, 40);

      // Separator - Middle
      ctx.fillStyle = '#f1f5f9'; // Slate 100
      ctx.fillRect(anodeWidth, 0, sepWidth, h);
      
      // Separator Pattern
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      for(let y=0; y<h; y+=10) {
        ctx.moveTo(anodeWidth, y);
        ctx.lineTo(anodeWidth + sepWidth, y + 5);
      }
      ctx.stroke();

      // Draw Lithium Ions (Li+)
      ctx.fillStyle = '#84cc16'; // Lime 500 (Lithium color representation)
      
      particles.forEach(p => {
        // Logic:
        // Discharging (Active): Ions move Anode -> Cathode (Left to Right)
        // Charging: Ions move Cathode -> Anode (Right to Left)
        // Idle: Random jitter

        if (isActive && !isCharging) {
           p.x += p.speed;
           if (p.x > w) p.x = 0;
        } else if (isCharging) {
           p.x -= p.speed;
           if (p.x < 0) p.x = w;
        } else {
            // Jitter
            p.x += (Math.random() - 0.5) * 0.5;
            p.y += (Math.random() - 0.5) * 0.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Flow arrows
      if (isActive || isCharging) {
          ctx.strokeStyle = isCharging ? '#ef4444' : '#3b82f6';
          ctx.lineWidth = 3;
          ctx.beginPath();
          const arrowY = h / 2;
          ctx.moveTo(w/2 - 30, arrowY);
          ctx.lineTo(w/2 + 30, arrowY);
          
          // Arrowhead
          if (isActive && !isCharging) {
             ctx.lineTo(w/2 + 20, arrowY - 10);
             ctx.moveTo(w/2 + 30, arrowY);
             ctx.lineTo(w/2 + 20, arrowY + 10);
          } else {
             ctx.moveTo(w/2 - 30, arrowY);
             ctx.lineTo(w/2 - 20, arrowY - 10);
             ctx.moveTo(w/2 - 30, arrowY);
             ctx.lineTo(w/2 - 20, arrowY + 10);
          }
          ctx.stroke();
          
          ctx.font = "bold 18px 'Noto Serif SC', sans-serif";
          ctx.fillStyle = isCharging ? '#ef4444' : '#3b82f6';
          const text = isCharging ? "充电中..." : "放电中...";
          const textWidth = ctx.measureText(text).width;
          ctx.fillText(text, w/2 - textWidth/2, arrowY + 40);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isActive, isCharging]);

  return (
    <div className="flex flex-col items-center h-full justify-center p-4">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-teal-900">锂离子电池</h3>
        <p className="text-teal-700 text-sm opacity-80">现代动力之源 (1991年 - 至今)</p>
      </div>

      <div className="relative w-full max-w-lg aspect-video bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden mb-6">
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={300} 
          className="w-full h-full object-cover"
        />
        
        {/* Charge Level Overlay */}
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 text-white text-sm">
            {isCharging ? <BatteryCharging size={16} className="text-green-400" /> : <Zap size={16} className={isActive ? "text-yellow-400" : "text-gray-400"} />}
            <span>{Math.round(chargeLevel)}%</span>
        </div>
      </div>

      <div className="w-full max-w-lg">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>空 (0%)</span>
              <span>满 (100%)</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isCharging ? 'bg-green-500' : (chargeLevel < 20 ? 'bg-red-500' : 'bg-teal-500')}`}
                style={{ width: `${chargeLevel}%` }}
              ></div>
          </div>
      </div>

       <div className="mt-6 p-4 bg-teal-50 rounded-lg text-sm text-teal-800 border border-teal-200 max-w-md">
        <h4 className="font-bold mb-1 flex items-center gap-2">
            <Zap size={16} /> 工作原理
        </h4>
        <p>放电时，锂离子从负极（石墨）移动到正极（金属氧化物），释放能量产生电流。充电时，外部电源迫使离子反向移动，将能量储存起来。</p>
      </div>
    </div>
  );
};