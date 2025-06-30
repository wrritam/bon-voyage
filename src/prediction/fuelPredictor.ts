import * as tf from "@tensorflow/tfjs-node";

import { getDataForFuelTraining } from "./dataProcessor";

interface inputFuelPrediction {
  cargoWeight: number;
  distance: number;
  weatherSeverity: number;
  windSpeed: number;
}

let model: tf.LayersModel | null = null;

export async function trainFuelModel() {
  const data = await getDataForFuelTraining();
  try {
  } catch (error: any) {
    console.log(error.message);
  }
}
