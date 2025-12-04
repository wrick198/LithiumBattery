import React, { useState, useEffect, useRef } from 'react';
import { SimMode, VoltaicConfig, LithiumConfig, DataPoint } from './types';
import { VoltaicPile } from './components/VoltaicPile';
import { LithiumBattery } from './components/LithiumBattery';
import { SimControls } from './components/SimControls';
import { GeminiTutor } from './components/GeminiTutor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Beaker, Battery, History } from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [mode, setMode] = useState<SimMode>(SimMode.VOLTAIC);
  const [isRunning, setIsRunning] = useState(false);
  
  // Physics State
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [resistance, setResistance] = useState(10); // Load resistance in Ohms
  const [power, setPower] = useState(0);
  const [time, setTime] = useState(0);
  
  // History for Graph
  const [history, setHistory] = useState<DataPoint[]>([]);

  // Specific Configurations
  const [voltaicConfig, setVoltaicConfig] = useState<VoltaicConfig>({
    layerCount: 5,
    electrolyteQuality: 1.0
  });

  const [lithiumCharge, setLithiumCharge] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  // Simulation Loop
  useEffect(() => {
    let interval: number;

    if (isRunning) {
      interval = window.setInterval(() => {
        setTime(prev => prev + 1);

        let v = 0;
        let internalR = 0;

        if (mode === SimMode.VOLTAIC) {
          // Voltaic Physics: V = Layers * 0.76. Internal R increases with layers.
          // Voltage drops over time due to polarization (bubbles forming).
          const maxV = voltaicConfig.layerCount * 0.76;
          internalR = voltaicConfig.layerCount * 0.5; // High internal resistance
          
          // Polarization effect: Voltage drops exponentially with time under load
          const dropFactor = Math.exp(-time / 200); 
          v = maxV * dropFactor;
        } else {
          // Lithium Physics: Steady ~3.7V.
          // Drops sharply at end of capacity.
          internalR = 0.1; // Low internal resistance
          
          if (lithiumCharge > 0) {
            // Discharge curve simulation
            const soc = lithiumCharge / 100;
            // Simple curve: 3.2 + 0.5*SoC + drop at very low
            v = 3.2 + (0.5 * soc) + (soc > 0.9 ? 0.3 : 0);
            if (soc < 0.1) v = v * (soc * 10);
            
            // Decrease charge
            const dischargeRate = (v / (resistance + internalR)) * 0.05; // Arbitrary scale
            setLithiumCharge(prev => Math.max(0, prev - dischargeRate));
          } else {
            v = 0;
            setIsRunning(false);
          }
        }

        // Circuit Law
        const totalR = resistance + internalR;
        const i = v / totalR;
        
        setVoltage(v);
        setCurrent(i);
        setPower(v * i);

        setHistory(prev => {
          const newPoint = { time: time, voltage: v, current: i };
          const newHistory = [...prev, newPoint];
          if (newHistory.length > 50) newHistory.shift();
          return newHistory;
        });

      }, 100); // 100ms ticks
    } else {
       // Reset instantaneous values when stopped, but keep history for a moment or handle differently?
       // Let's keep values displayed but stop updating time.
       if (mode === SimMode.LITHIUM && isCharging) {
          interval = window.setInterval(() => {
              setLithiumCharge(prev => Math.min(100, prev + 0.5));
          }, 50);
       }
    }

    return () => clearInterval(interval);
  }, [isRunning, mode, voltaicConfig, resistance, time, lithiumCharge, isCharging]);

  // Recalculate static voltage when not running (Open Circuit Voltage)
  useEffect(() => {
    if (!isRunning) {
      if (mode === SimMode.VOLTAIC) {
         setVoltage(voltaicConfig.layerCount * 0.76);
         setCurrent(0);
         setPower(0);
      } else {
         // OCV for Lithium
         if (!isCharging) {
            const soc = lithiumCharge / 100;
            const v = 3.2 + (0.5 * soc) + (soc > 0.9 ? 0.3 : 0);
            setVoltage(v);
            setCurrent(0);
            setPower(0);
         }
      }
    }
  }, [mode, voltaicConfig, lithiumCharge, isRunning, isCharging]);


  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setHistory([]);
    setLithiumCharge(100);
    setVoltage(0);
    setCurrent(0);
  };

  const toggleMode = (m: SimMode) => {
    setMode(m);
    handleReset();
    setIsCharging(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-serif">
             <span className="bg-indigo-600 text-white p-1 rounded-lg">
                <Beaker size={20} />
             </span>
             物理人生：从伏打电堆到锂电池
           </h1>
           <p className="text-sm text-slate-500 mt-1 font-serif tracking-wide hidden md:block">
             电源测量与科学精神的演进
           </p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => toggleMode(SimMode.VOLTAIC)}
             className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${mode === SimMode.VOLTAIC ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <History size={16} /> 伏打电堆 (1800年)
           </button>
           <button 
             onClick={() => toggleMode(SimMode.LITHIUM)}
             className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${mode === SimMode.LITHIUM ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <Battery size={16} /> 锂离子电池 (现代)
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 overflow-hidden flex flex-col md:flex-row gap-6">
        
        {/* Left: Simulation Visualization */}
        <section className="flex-grow flex flex-col gap-6 h-full overflow-y-auto">
           {/* Visualizer Area */}
           <div className="flex-grow bg-slate-100/50 rounded-3xl border border-slate-200 relative overflow-hidden flex flex-col">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
              
              <div className="flex-grow relative z-10">
                {mode === SimMode.VOLTAIC ? (
                  <VoltaicPile config={voltaicConfig} setConfig={setVoltaicConfig} isActive={isRunning} />
                ) : (
                  <LithiumBattery 
                    config={{ capacity: 3000, cycles: 0 }} 
                    chargeLevel={lithiumCharge} 
                    isActive={isRunning} 
                    isCharging={isCharging}
                  />
                )}
              </div>

              {/* Lithium Specific Charging Controls */}
              {mode === SimMode.LITHIUM && (
                 <div className="p-4 bg-white/80 backdrop-blur border-t border-slate-200 flex justify-center gap-4">
                    <button 
                      onClick={() => { setIsCharging(!isCharging); setIsRunning(false); }}
                      className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${isCharging ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                      {isCharging ? '停止充电' : '连接充电器'}
                    </button>
                 </div>
              )}
           </div>

           {/* Chart Area */}
           <div className="h-48 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hidden md:block">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">实时电压与电流</h3>
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" hide />
                    <YAxis yAxisId="left" domain={[0, 'auto']} stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v.toFixed(1)}V`} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v.toFixed(2)}A`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="voltage" stroke="#4f46e5" strokeWidth={2} dot={false} animationDuration={300} />
                    <Line yAxisId="right" type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} dot={false} animationDuration={300} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>
        </section>

        {/* Right: Controls Sidebar */}
        <aside className="w-full md:w-80 lg:w-96 flex-shrink-0">
           <SimControls 
             isRunning={isRunning}
             toggleRun={() => { setIsRunning(!isRunning); setIsCharging(false); }}
             reset={handleReset}
             voltage={voltage}
             current={current}
             power={power}
             resistance={resistance}
             setResistance={setResistance}
             modeName={mode}
           />
        </aside>

      </main>

      {/* Floating Gemini Tutor */}
      <GeminiTutor mode={mode} voltage={voltage} current={current} />

    </div>
  );
};

export default App;