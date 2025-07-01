import prisma from "../configs/db";
import { subMonths } from "date-fns";
import {
  inputFuelTraining,
  inputRouteTraining,
  MaintenanceTrainingInput,
  MaintenanceTrainingLabel,
} from "../types/type";

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

export async function getDataForMaintenanceTraining(): Promise<
  (MaintenanceTrainingInput & MaintenanceTrainingLabel)[]
> {
  const records = await prisma.maintenanceRecord.findMany({
    include: {
      ship: {
        include: {
          voyages: {
            where: {
              departureDate: {
                gte: subMonths(new Date(), 6),
              },
            },
            include: { fuelLogs: true },
          },
        },
      },
    },
  });

  return records
    .filter((r) => r.nextDue && r.voyageReadyDate && r.score)
    .map((record) => {
      const voyages = record.ship.voyages;
      const totalVoyages = voyages.length;
      const avgFuelUsage =
        voyages.reduce((sum, voyage) => {
          return sum + voyage.fuelLogs.reduce((s, f) => s + f.fuelUsage, 0);
        }, 0) / (totalVoyages || 1);

      const daysSinceLastMaint = Math.floor(
        (new Date().getTime() - record.maintainedAt.getTime()) /
          (1000 * 3600 * 24)
      );

      return {
        totalVoyagesLast6M: totalVoyages,
        avgFuelUsagePerVoyage: parseFloat(avgFuelUsage.toFixed(2)),
        daysSinceLastMaint,
        nextDueDays: Math.floor(
          (record.nextDue!.getTime() - record.maintainedAt.getTime()) /
            (1000 * 3600 * 24)
        ),
        voyageReadyOffset: Math.floor(
          (record.voyageReadyDate!.getTime() - record.nextDue!.getTime()) /
            (1000 * 3600 * 24)
        ),
        score: record.score!,
      };
    });
}
