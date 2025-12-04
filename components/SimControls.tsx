import React from 'react';
import { Play, Pause, RefreshCw, Lightbulb, Zap } from 'lucide-react';

interface SimControlsProps {
  isRunning: boolean;
  toggleRun: () => void;
  reset: () => void;
  voltage: number;
  current: number;
  power: number;
  resistance: number;
  setResistance: (val: number) => void;
  modeName: string;
}

export const SimControls: React.FC<SimControlsProps> = ({
  isRunning, toggleRun, reset, voltage, current, power, resistance, setResistance, modeName
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <Zap className="text-yellow-500 fill-yellow-500" />
        电路实验室
      </h2>

      <div className="space-y-6 flex-grow">
        
        {/* Readings Panel */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">电压 (V)</div>
            <div className="text-2xl font-mono font-bold text-slate-800">{voltage.toFixed(2)}<span className="text-sm text-slate-500 ml-1">V</span></div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">电流 (A)</div>
            <div className="text-2xl font-mono font-bold text-slate-800">{current.toFixed(3)}<span className="text-sm text-slate-500 ml-1">A</span></div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">输出功率 (W)</div>
            <div className="text-2xl font-mono font-bold text-indigo-600">{power.toFixed(2)}<span className="text-sm text-slate-500 ml-1">W</span></div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                <span>负载电阻</span>
                <span className="text-slate-500 font-mono">{resistance} Ω</span>
             </label>
             <input 
               type="range" 
               min="1" 
               max="100" 
               value={resistance} 
               onChange={(e) => setResistance(Number(e.target.value))}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
             />
             <div className="flex justify-between text-xs text-slate-400 mt-1">
               <span>短路 (1Ω)</span>
               <span>开路 (100Ω)</span>
             </div>
           </div>
        </div>
        
        {/* Load Visualizer */}
        <div className="flex justify-center py-4">
           <div className={`relative transition-all duration-300 ${power > 0 ? 'scale-110' : 'scale-100 opacity-50'}`}>
              <Lightbulb 
                 size={64} 
                 className={`transition-all duration-300 ${power > 0 ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'text-slate-300'}`}
              />
              {power > 0 && (
                <div 
                  className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-20"
                  style={{ opacity: Math.min(power / 10, 0.8) }} 
                ></div>
              )}
           </div>
        </div>

      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <button 
          onClick={toggleRun}
          className={`py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            isRunning 
              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isRunning ? <><Pause size={18} /> 停止实验</> : <><Play size={18} /> 开始实验</>}
        </button>
        <button 
          onClick={reset}
          className="py-3 px-4 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw size={18} /> 重置
        </button>
      </div>
    </div>
  );
};