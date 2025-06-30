import * as tf from "@tensorflow/tfjs-node";
import { getDataForRouteTraining } from "./dataProcessor";
import { inputRouteOptimization, outputRouteOptimization } from "../types/type";

let durationModel: tf.Sequential | null = null;
let speedModel: tf.Sequential | null = null;

export async function trainRouteModel() {
  const data = await getDataForRouteTraining();

  if (data.length === 0) {
    throw new Error("Not enough data to train the route optimization model.");
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

    const durationLabels = tf.tensor2d(
      data.map((d) => [d.actualDuration]),
      [data.length, 1]
    );

    const speedLabels = tf.tensor2d(
      data.map((d) => [d.distance / d.actualDuration]),
      [data.length, 1]
    );

    //for duration
    durationModel = tf.sequential();
    durationModel.add(
      tf.layers.dense({ units: 16, activation: "relu", inputShape: [4] })
    );
    durationModel.add(tf.layers.dense({ units: 8, activation: "relu" }));
    durationModel.add(tf.layers.dense({ units: 1 }));

    durationModel.compile({
      loss: "meanSquaredError",
      optimizer: "adam",
    });

    await durationModel.fit(inputs, durationLabels, {
      epochs: 100,
      batchSize: 8,
      validationSplit: 0.3,
      shuffle: true,
      verbose: 1,
    });

    //for speed
    speedModel = tf.sequential();
    speedModel.add(
      tf.layers.dense({ units: 16, activation: "relu", inputShape: [4] })
    );
    speedModel.add(tf.layers.dense({ units: 8, activation: "relu" }));
    speedModel.add(tf.layers.dense({ units: 1 }));

    speedModel.compile({
      loss: "meanSquaredError",
      optimizer: "adam",
    });

    await speedModel.fit(inputs, speedLabels, {
      epochs: 100,
      batchSize: 8,
      validationSplit: 0.3,
      shuffle: true,
      verbose: 1,
    });

    // again same accuracy calc
    const durationPredictions = durationModel.predict(inputs) as tf.Tensor;
    const durationMaeTensor = tf.metrics.meanAbsoluteError(
      durationLabels,
      durationPredictions
    );
    const durationMaeValue = (await durationMaeTensor.data())[0];
    const avgDuration =
      data.reduce((acc, d) => acc + d.actualDuration, 0) / data.length;
    const durationAccuracy = 1 - durationMaeValue / avgDuration;

    const speedPredictions = speedModel.predict(inputs) as tf.Tensor;
    const speedMaeTensor = tf.metrics.meanAbsoluteError(
      speedLabels,
      speedPredictions
    );
    const speedMaeValue = (await speedMaeTensor.data())[0];
    const avgSpeed =
      data.reduce((acc, d) => acc + d.distance / d.actualDuration, 0) /
      data.length;
    const speedAccuracy = 1 - speedMaeValue / avgSpeed;

    const totalAccuracy = ((durationAccuracy + speedAccuracy) / 2).toFixed(4);

    //clean up
    inputs.dispose();
    durationLabels.dispose();
    speedLabels.dispose();
    durationPredictions.dispose();
    durationMaeTensor.dispose();
    speedPredictions.dispose();
    speedMaeTensor.dispose();

    console.log("Route Optimization model training complete.");

    return {
      modelType: "route_optimizer",
      version: `v${Date.now()}`,
      parameters: {
        inputFeatures: [
          "cargoWeight",
          "distance",
          "weatherSeverity",
          "windSpeed",
        ],
        durationLayers: [16, 8, 1],
        speedLayers: [16, 8, 1],
        activation: "relu",
        optimizer: "adam",
        epochs: 100,
        batchSize: 8,
      },
      accuracy: parseFloat(totalAccuracy),
    };
  } catch (error: any) {
    console.error("Error during route model training: ", error.message);
    throw error;
  }
}

export async function predictRouteOptimization(
  input: inputRouteOptimization
): Promise<outputRouteOptimization> {
  if (!durationModel || !speedModel) {
    throw new Error("Route optimization model is not trained yet.");
  }

  const inputTensor = tf.tensor2d([
    [input.cargoWeight, input.distance, input.weatherSeverity, input.windSpeed],
  ]);

  const durationPrediction = durationModel.predict(inputTensor) as tf.Tensor;
  const optimalSpeedPrediction = speedModel.predict(inputTensor) as tf.Tensor;

  const durationValue = (await durationPrediction.array()) as number[][];
  const speedValue = (await optimalSpeedPrediction.array()) as number[][];

  const predictedDuration = durationValue[0][0];
  const optimalSpeed = speedValue[0][0];

  // Clean up tensors
  inputTensor.dispose();
  durationPrediction.dispose();
  optimalSpeedPrediction.dispose();

  const speedSchedule = [];
  const segmentDistance = input.distance / 4;
  for (let i = 0; i < 4; i++) {
    speedSchedule.push({
      segment: i + 1,
      distance: segmentDistance.toFixed(2),
      speed: (optimalSpeed * (0.95 + Math.random() * 0.1)).toFixed(2),
    });
  }

  return {
    predictedDuration: predictedDuration,
    optimalSpeed: optimalSpeed,
    speedSchedule: speedSchedule,
  };
}
