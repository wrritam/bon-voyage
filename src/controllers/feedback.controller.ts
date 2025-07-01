import { Request, Response } from "express";
import prisma from "../configs/db";

export const provideFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { voyageId, actualFuelUsage, actualDuration } = req.body;

  try {
    const voyage = await prisma.voyage.findUnique({
      where: { id: voyageId },
    });

    if (!voyage) {
      res.status(404).json({ error: "Voyage not found" });
      return;
    }

    // some basic calc
    let fuelAccuracy = null;
    let durationAccuracy = null;
    let routeOptimizationScore = 1;

    if (voyage.predictedFuelUsage && actualFuelUsage) {
      const error = Math.abs(actualFuelUsage - voyage.predictedFuelUsage);
      const accuracy = Math.max(0, 1 - error / voyage.predictedFuelUsage);
      fuelAccuracy = parseFloat((accuracy * 100).toFixed(2));
    }

    if (voyage.predictedDuration && actualDuration) {
      const error = Math.abs(actualDuration - voyage.predictedDuration);
      const accuracy = Math.max(0, 1 - error / voyage.predictedDuration);
      durationAccuracy = parseFloat((accuracy * 100).toFixed(2));
    }

    // basic optimization scoring scenario
    if ((fuelAccuracy ?? 0) > 95 && (durationAccuracy ?? 0) > 95) {
      routeOptimizationScore = 5;
    } else if ((fuelAccuracy ?? 0) > 90 && (durationAccuracy ?? 0) > 90) {
      routeOptimizationScore = 4;
    } else if ((fuelAccuracy ?? 0) > 80 && (durationAccuracy ?? 0) > 80) {
      routeOptimizationScore = 3;
    } else if ((fuelAccuracy ?? 0) > 70 && (durationAccuracy ?? 0) > 70) {
      routeOptimizationScore = 2;
    }

    const feedback = await prisma.voyageFeedback.create({
      data: {
        voyageId,
        actualFuelUsage,
        actualDuration,
        fuelAccuracy,
        durationAccuracy,
        routeOptimizationScore,
      },
    });

    res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (error: any) {
    console.error(" Error submitting feedback:", error.message);
    res.status(500).json({ error: "Internal Server error" });
  }
};
