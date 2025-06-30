import * as tf from "@tensorflow/tfjs-node";

import { getDataForFuelTraining } from "./dataProcessor";
import { inputFuelPrediction } from "../types/type";

let model: tf.Sequential | null = null;

export async function trainFuelModel() {
  const data = await getDataForFuelTraining();

  if (data.length === 0) {
    throw new Error("Not enough data to train the fuel prediction model.");
  }
  try {
    const inputs = tf.tensor2d(
      data.map((d) => [
        d.cargoWeight,
        d.distance,
        d.weatherSeverity,
        d.windSpeed,
      ]),
      [data.length, 4]
    );
    const labels = tf.tensor2d(
      data.map((d) => [d.actualFuelUsage]),
      [data.length, 1]
    );

    model = tf.sequential();

    model.add(
      tf.layers.dense({ units: 16, activation: "relu", inputShape: [4] })
    );
    model.add(tf.layers.dense({ units: 8, activation: "relu" }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({
      loss: "meanSquaredError",
      optimizer: "adam",
    });

    await model.fit(inputs, labels, {
      epochs: 100,
      batchSize: 8,
      validationSplit: 0.3,
      shuffle: true,
      verbose: 1,
    });

    // accuracy calc
    const predictions = model.predict(inputs) as tf.Tensor;
    const maeTensor = tf.metrics.meanAbsoluteError(labels, predictions);
    const maeValue = (await maeTensor.data())[0];
    const avgLabel =
      data.reduce((acc, d) => acc + d.actualFuelUsage, 0) / data.length;
    const accuracy = 1 - maeValue / avgLabel;

    //clean up
    inputs.dispose();
    labels.dispose();
    predictions.dispose();
    maeTensor.dispose();

    console.log("Fuel model trained successfully");

    return {
      modelType: "fuel_predictor",
      version: `v${Date.now()}`,
      parameters: {
        inputFeatures: [
          "cargoWeight",
          "distance",
          "weatherSeverity",
          "windSpeed",
        ],
        layers: [16, 8, 1],
        activation: "relu",
        optimizer: "adam",
        epochs: 100,
        batchSize: 8,
      },
      accuracy: parseFloat(accuracy.toFixed(4)),
    };
  } catch (error: any) {
    console.log("Error during route model training: ", error.message);
    throw error;
  }
}

export async function fuelUsagePrediction(input: inputFuelPrediction) {
  if (!model) {
    throw new Error("Model not trained yet");
  }

  const inputs = tf.tensor2d([
    [input.cargoWeight, input.distance, input.weatherSeverity, input.windSpeed],
  ]);
  const prediction = model.predict(inputs) as tf.Tensor;

  const output = await prediction.array();

  //clean up
  inputs.dispose();
  prediction.dispose();

  return parseFloat((output as number[][])[0][0].toFixed(2));
}
