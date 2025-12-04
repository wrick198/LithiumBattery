import React, { useMemo } from 'react';
import { METALS, VoltaicConfig } from '../types';
import { Layers, Plus, Minus } from 'lucide-react';

interface VoltaicPileProps {
  config: VoltaicConfig;
  setConfig: React.Dispatch<React.SetStateAction<VoltaicConfig>>;
  isActive: boolean;
}

export const VoltaicPile: React.FC<VoltaicPileProps> = ({ config, setConfig, isActive }) => {
  // Each pair is ~0.76V ideally, realistically less under load
  const estimatedVoltage = (config.layerCount * 0.76).toFixed(2);
  
  const handleAddLayer = () => {
    if (config.layerCount < 20) {
      setConfig(prev => ({ ...prev, layerCount: prev.layerCount + 1 }));
    }
  };

  const handleRemoveLayer = () => {
    if (config.layerCount > 1) {
      setConfig(prev => ({ ...prev, layerCount: prev.layerCount - 1 }));
    }
  };

  const layers = useMemo(() => {
    const items = [];
    for (let i = 0; i < config.layerCount; i++) {
      items.push(
        <div key={i} className="flex flex-col items-center -mb-4 relative z-10 transition-all duration-300">
          {/* Copper Disk */}
          <div 
            className="w-32 h-6 rounded-full border-2 border-orange-900 shadow-md transform hover:scale-105 transition-transform"
            style={{ backgroundColor: METALS.COPPER }}
          />
          {/* Electrolyte Pad */}
          <div 
            className="w-28 h-4 rounded-full border border-yellow-200 opacity-90 -mt-2"
            style={{ backgroundColor: METALS.ELECTROLYTE }}
          />
          {/* Zinc Disk */}
          <div 
            className="w-32 h-6 rounded-full border-2 border-slate-600 shadow-sm -mt-2"
            style={{ backgroundColor: METALS.ZINC }}
          />
        </div>
      );
    }
    return items.reverse(); // Stack bottom up
  }, [config.layerCount]);

  return (
    <div className="flex flex-col items-center h-full justify-center p-4">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-serif font-bold text-amber-900">伏打电堆</h3>
        <p className="text-amber-700 text-sm opacity-80">人类第一块电池 (1800年)</p>
      </div>

      <div className="relative flex-grow flex items-end justify-center w-full max-h-[400px] mb-8">
         <div className="flex flex-col items-center space-y-0 w-full overflow-y-auto overflow-x-hidden pt-10 pb-4 pr-2 custom-pile-scroll">
            {layers}
            <div className="w-40 h-4 bg-slate-800 rounded-full mt-[-10px] opacity-20 blur-sm"></div>
         </div>
         
         {/* Sparks/Activity Indicator */}
         {isActive && (
           <div className="absolute top-0 right-10 animate-pulse">
             <div className="text-yellow-500 font-bold text-xl">⚡ {estimatedVoltage}V</div>
           </div>
         )}
      </div>

      <div className="flex gap-4 bg-white/50 p-4 rounded-xl backdrop-blur-sm border border-amber-100 shadow-sm">
        <button 
          onClick={handleRemoveLayer}
          className="p-3 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-700 transition-colors disabled:opacity-50"
          disabled={config.layerCount <= 1}
        >
          <Minus size={20} />
        </button>
        <div className="flex flex-col items-center w-32">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">电堆层数</span>
          <span className="text-2xl font-bold text-amber-900">{config.layerCount} 层</span>
        </div>
        <button 
          onClick={handleAddLayer}
          className="p-3 bg-amber-500 hover:bg-amber-600 rounded-full text-white transition-colors disabled:opacity-50"
          disabled={config.layerCount >= 20}
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-200 max-w-md text-center">
        <Layers className="inline-block w-4 h-4 mr-2" />
        将锌盘和铜盘交替堆叠，中间隔着浸透盐水的布，从而产生持续的电流。
      </div>
    </div>
  );
};