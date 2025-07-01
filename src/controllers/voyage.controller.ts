import { Request, Response } from "express";
import prisma from "../configs/db";
import { fuelUsagePrediction } from "../prediction/fuelPredictor";
import { predictRouteOptimization } from "../prediction/routeOptimizer";
import { inputFuelPrediction, inputRouteOptimization } from "../types/type";

export const planVoyage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      shipId,
      name,
      origin,
      destination,
      distance,
      cargoWeight,
      cargoType,
      weatherSeverity,
      windSpeed,
      departureDate,
    } = req.body;

    if (
      !shipId ||
      !name ||
      !origin ||
      !destination ||
      distance == null ||
      cargoWeight == null ||
      weatherSeverity == null ||
      windSpeed == null
    ) {
      res.status(400).json({ error: "All fields are required" });
    }

    const departure = departureDate ? new Date(departureDate) : new Date();
    if (departure < new Date()) {
      res.status(400).json({ error: "Departure date cannot be in the past" });
    }

    const inputForRoute: inputRouteOptimization = {
      cargoWeight,
      distance,
      weatherSeverity,
      windSpeed,
    };

    const inputForFuel: inputFuelPrediction = {
      cargoWeight,
      distance,
      weatherSeverity,
      windSpeed,
    };

    //preds for route opt
    const { predictedDuration, optimalSpeed, speedSchedule } =
      await predictRouteOptimization(inputForRoute);

    //fuel pred
    const predictedFuelUsage = await fuelUsagePrediction(inputForFuel);

    const arrivalTime = new Date(
      departure.getTime() + predictedDuration * 60 * 60 * 1000
    );

    //save the voyage
    const newVoyage = await prisma.voyage.create({
      data: {
        shipId,
        name,
        origin,
        destination,
        distance,
        cargoWeight,
        cargoType,
        weatherSeverity,
        windSpeed,
        departureDate: departure,
        arrivalTime: arrivalTime,
        predictedDuration,
        predictedFuelUsage,
        optimalSpeed,
        speedSchedule,
        userId: "03cd721a-211d-449a-b4d9-2975a1b9c5d4", //if use auth then update with req.user.userId
      },
    });

    res.status(201).json({
      message: "Voyage planned successfully",
      voyageId: newVoyage.id,
      predictedDuration: predictedDuration,
      predictedFuelUsage: predictedFuelUsage,
      optimalSpeed: optimalSpeed,
      speedSchedule: speedSchedule,
      departureDate: departure,
      arrivalTime: arrivalTime,
    });
  } catch (error: any) {
    console.error("Error in planVoyage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const planHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const voyages = await prisma.voyage.findMany({
      include: {
        feedbacks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const historicalData = voyages.map((voyage) => {
      const latestFeedback = voyage.feedbacks?.[voyage.feedbacks.length - 1];
      return {
        voyageId: voyage.id,
        name: voyage.name,
        origin: voyage.origin,
        destination: voyage.destination,
        distance: voyage.distance,
        departureDate: voyage.departureDate,
        predictedArrivalTime: voyage.arrivalTime,
        predictedDuration: voyage.predictedDuration,
        actualDuration: latestFeedback?.actualDuration || null,
        predictedFuelUsage: voyage.predictedFuelUsage,
        actualFuelUsage: latestFeedback?.actualFuelUsage || null,
        optimalSpeed: voyage.optimalSpeed,
        speedSchedule: voyage.speedSchedule,
      };
    });

    res.status(200).json(historicalData);
  } catch (error: any) {
    console.error("Error in getting historical data:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const planHistoryByVoyageId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { voyageId } = req.params;

  try {
    const voyage = await prisma.voyage.findUnique({
      where: { id: voyageId },
      include: { feedbacks: true },
    });

    if (!voyage) {
      res.status(404).json({ error: "Voyage not found" });
      return;
    }

    const latestFeedback = voyage.feedbacks?.[voyage.feedbacks.length - 1];

    const result = {
      voyageId: voyage.id,
      name: voyage.name,
      origin: voyage.origin,
      destination: voyage.destination,
      distance: voyage.distance,
      departureDate: voyage.departureDate,
      arrivalTime: voyage.arrivalTime,
      predictedFuelUsage: voyage.predictedFuelUsage,
      actualFuelUsage: latestFeedback?.actualFuelUsage || null,
      predictedDuration: voyage.predictedDuration,
      actualDuration: latestFeedback?.actualDuration || null,
      optimalSpeed: voyage.optimalSpeed,
      speedSchedule: voyage.speedSchedule,
    };

    res.status(200).json(result);
  } catch (err: any) {
    console.error("Error in getting data:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
