export enum SimMode {
  VOLTAIC = 'VOLTAIC',
  LITHIUM = 'LITHIUM'
}

export interface SimulationState {
  isRunning: boolean;
  voltage: number;
  current: number;
  resistance: number;
  temperature: number;
  chargeLevel: number; // 0-100
  history: DataPoint[];
}

export interface DataPoint {
  time: number;
  voltage: number;
  current: number;
}

export interface VoltaicConfig {
  layerCount: number; // Number of Zinc-Copper pairs
  electrolyteQuality: number; // 0-1 (affects internal resistance)
}

export interface LithiumConfig {
  capacity: number; // mAh
  cycles: number; // degradation factor
}

export const METALS = {
  ZINC: '#94a3b8',
  COPPER: '#b45309',
  ELECTROLYTE: '#fef3c7'
};