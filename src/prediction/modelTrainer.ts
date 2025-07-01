import prisma from "../configs/db";
import { trainFuelModel } from "./fuelPredictor";
import { trainRouteModel } from "./routeOptimizer";
import { trainMaintenanceModel } from "./maintenance";

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

  const routeMetaData = await trainRouteModel();

  if (routeMetaData) {
    await prisma.aIModel.updateMany({
      where: { modelType: "route_optimizer" },
      data: { isActive: false },
    });
    await prisma.aIModel.create({
      data: {
        modelType: routeMetaData.modelType,
        version: routeMetaData.version,
        parameters: routeMetaData.parameters,
        accuracy: routeMetaData.accuracy,
        trainedAt: new Date(),
        isActive: true,
      },
    });
    console.log("Route Optimizer model data saved");
  } else {
    console.warn("Route model training failed. onto the next one.");
  }

  const maintenanceMeta = await trainMaintenanceModel();

  if (maintenanceMeta) {
    await prisma.aIModel.updateMany({
      where: { modelType: "maintenance_forecaster" },
      data: { isActive: false },
    });

    await prisma.aIModel.create({
      data: {
        modelType: maintenanceMeta.modelType,
        version: maintenanceMeta.version,
        parameters: maintenanceMeta.parameters,
        accuracy: maintenanceMeta.accuracy,
        trainedAt: new Date(),
        isActive: true,
      },
    });

    console.log("Maintenance Forecaster model data saved");
  } else {
    console.warn("Maintenance model training failed. On to the next one.");
  }
}
