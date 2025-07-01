import { trainModels } from "../src/prediction/modelTrainer";

async function main() {
  try {
    console.log("Starting model training...");
    await trainModels();
    console.log("Model training completed successfully.");
  } catch (error: any) {
    console.error("Error during model training:", error.message);
  }
}

main();
