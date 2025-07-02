// for dataProcessor.ts
export interface inputFuelTraining {
  cargoWeight: number;
  distance: number;
  weatherSeverity: number;
  windSpeed: number;
  actualFuelUsage: number;
}

export interface inputRouteTraining {
  cargoWeight: number;
  distance: number;
  weatherSeverity: number;
  windSpeed: number;
  actualDuration: number;
}

export interface MaintenanceTrainingInput {
  totalVoyagesLast6M: number;
  avgFuelUsagePerVoyage: number;
  daysSinceLastMaint: number;
}

export interface MaintenanceTrainingLabel {
  nextDueDays: number;
  voyageReadyOffset: number;
  score: number;
}

// for fuelPredictor.ts
export interface inputFuelPrediction {
  cargoWeight: number;
  distance: number;
  weatherSeverity: number;
  windSpeed: number;
}

// for routeOptimizer.ts

export interface inputRouteOptimization {
  cargoWeight: number;
  distance: number;
  weatherSeverity: number;
  windSpeed: number;
}

export interface outputRouteOptimization {
  predictedDuration: number;
  optimalSpeed: number;
  speedSchedule: {
    segment: number;
    distance: string;
    speed: string;
  }[];
}

// for maintenance.ts
export interface MaintenancePredictionOutput {
  voyageReadyDate: any;
  nextDue: number;
  voyageReadyOffset: number;
  score: number;
}
