import prisma from "../configs/db";
import { trainFuelModel } from "./fuelPredictor";
export async function trainModels() {
  const fuelMetaData = await trainFuelModel();
  if (fuelMetaData) {
    await prisma.aIModel.updateMany({
      where: { modelType: "fuel_predictor" },
      data: { isActive: false },
    });
    await prisma.aIModel.create({
      data: {
        modelType: fuelMetaData.modelType,
        version: fuelMetaData.version,
        parameters: fuelMetaData.parameters,
        accuracy: fuelMetaData.accuracy,
        trainedAt: new Date(),
        isActive: true,
      },
    });
    console.log("Fuel Predictor model data saved.");
  } else {
    console.warn("Fuel model training failed. onto the next one");
  }
}
