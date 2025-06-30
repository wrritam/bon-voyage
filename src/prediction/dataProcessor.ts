import prisma from "../configs/db";
import { inputFuelTraining, inputRouteTraining } from "../types/type";

export async function getDataForFuelTraining(): Promise<inputFuelTraining[]> {
  const readyToTrainVoyages = await prisma.voyage.findMany({
    include: {
      feedbacks: true,
    },
    where: {
      feedbacks: {
        some: {
          actualFuelUsage: {
            not: null,
          },
        },
      },
    },
  });

  return readyToTrainVoyages.flatMap((voyage) => {
    return voyage.feedbacks
      .filter((feedback) => feedback.actualFuelUsage !== null)
      .map((feedback) => ({
        cargoWeight: voyage.cargoWeight,
        distance: voyage.distance,
        weatherSeverity: voyage.weatherSeverity,
        windSpeed: voyage.windSpeed,
        actualFuelUsage: feedback.actualFuelUsage!,
      }));
  });
}

export async function getDataForRouteTraining(): Promise<inputRouteTraining[]> {
  const readyToTrainVoyages = await prisma.voyage.findMany({
    include: {
      feedbacks: true,
    },
    where: {
      feedbacks: {
        some: {
          actualDuration: {
            not: null,
          },
        },
      },
    },
  });

  return readyToTrainVoyages.flatMap((voyage) => {
    return voyage.feedbacks
      .filter((feedback) => feedback.actualDuration !== null)
      .map((feedback) => ({
        cargoWeight: voyage.cargoWeight,
        distance: voyage.distance,
        weatherSeverity: voyage.weatherSeverity,
        windSpeed: voyage.windSpeed,
        actualDuration: feedback.actualDuration!,
      }));
  });
}
