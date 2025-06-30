import prisma from "../configs/db";

interface inputFuelTraining {
  cargoWeight: number;
  distance: number;
  weatherSeverity: number;
  windSpeed: number;
  actualFuelUsage: number;
}

export async function getDataForFuelTraining(): Promise<inputFuelTraining[]> {
  const redayToTrainVoyages = await prisma.voyage.findMany({
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

  return redayToTrainVoyages.flatMap((voyage) => {
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
