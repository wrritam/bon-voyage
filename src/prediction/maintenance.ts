import * as tf from "@tensorflow/tfjs";
import {
  MaintenanceTrainingInput,
  MaintenancePredictionOutput,
} from "../types/type";
import { getDataForMaintenanceTraining } from "./dataProcessor";

let model: tf.Sequential | null = null;

export async function trainMaintenanceModel() {
  const data = await getDataForMaintenanceTraining();
  if (!data.length) throw new Error("No maintenance training data available.");

  const inputs = tf.tensor2d(
    data.map((d) => [
      d.totalVoyagesLast6M,
      d.avgFuelUsagePerVoyage,
      d.daysSinceLastMaint,
    ])
  );

  const labels = tf.tensor2d(
    data.map((d) => [d.nextDueDays, d.voyageReadyOffset, d.score])
  );

  model = tf.sequential();
  model.add(
    tf.layers.dense({ units: 32, activation: "relu", inputShape: [3] })
  );
  model.add(tf.layers.dense({ units: 16, activation: "relu" }));
  model.add(tf.layers.dense({ units: 3 }));

  model.compile({
    loss: "meanSquaredError",
    optimizer: "adam",
  });

  await model.fit(inputs, labels, {
    epochs: 100,
    batchSize: 16,
    validationSplit: 0.2,
    shuffle: true,
    verbose: 0,
  });

  // same calc
  const preds = model.predict(inputs) as tf.Tensor;
  const mae = tf.metrics.meanAbsoluteError(labels, preds);
  const maeVal = (await mae.data())[0];

  const avgLabel =
    data.reduce((acc, d) => acc + d.nextDueDays, 0) / data.length;
  const accuracy = 1 - maeVal / avgLabel;

  //clean up
  inputs.dispose();
  labels.dispose();
  preds.dispose();
  mae.dispose();

  console.log("Maintenance Forecast model trained successfully.");

  return {
    modelType: "maintenance_forecaster",
    version: `v${Date.now()}`,
    parameters: {
      inputFeatures: [
        "totalVoyagesLast6M",
        "avgFuelUsagePerVoyage",
        "daysSinceLastMaint",
      ],
      layers: [32, 16, 3],
      activation: "relu",
      optimizer: "adam",
      epochs: 100,
      batchSize: 16,
    },
    accuracy: parseFloat(accuracy.toFixed(4)),
  };
}

export async function predictMaintenance(
  input: MaintenanceTrainingInput
): Promise<MaintenancePredictionOutput> {
  if (!model) throw new Error("Maintenance model not trained");

  const inputs = tf.tensor2d([
    [
      input.totalVoyagesLast6M,
      input.avgFuelUsagePerVoyage,
      input.daysSinceLastMaint,
    ],
  ]);

  const prediction = model.predict(inputs) as tf.Tensor;
  const predictionArray = (await prediction.array()) as number[][];
  const [nextDue, voyageReadyOffset, rawScore] = predictionArray[0];

  //clean up
  inputs.dispose();
  prediction.dispose();

  return {
    nextDue: Math.round(nextDue),
    voyageReadyOffset: Math.round(voyageReadyOffset),
    score: Math.min(5, Math.max(1, Math.round(rawScore))),
  };
}
