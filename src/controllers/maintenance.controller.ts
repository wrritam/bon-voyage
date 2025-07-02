import { Request, Response } from "express";
import { predictMaintenance } from "../prediction/maintenance";
import prisma from "../configs/db";

export const getMaintenanceAlert = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { shipId } = req.params;

    const voyages = await prisma.voyage.findMany({
      where: { shipId },
      include: { fuelLogs: true },
    });

    if (voyages.length === 0) {
      res.status(404).json({ error: "No voyages found for this ship" });
    }

    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const voyagesInLast6M = voyages.filter(
      (v) => new Date(v.departureDate) >= sixMonthsAgo
    );

    const totalVoyagesLast6M = voyagesInLast6M.length;

    const allFuelUsage = voyages.flatMap((v) =>
      v.fuelLogs.map((f) => f.fuelUsage)
    );
    const totalFuelUsed = allFuelUsage.reduce((sum, val) => sum + val, 0);
    const avgFuelUsagePerVoyage =
      voyages.length > 0 ? totalFuelUsed / voyages.length : 0;

    const lastMaint = await prisma.maintenanceRecord.findFirst({
      where: { shipId },
      orderBy: { maintainedAt: "desc" },
    });

    //basic fall back calc
    const daysSinceLastMaint = lastMaint
      ? Math.floor(
          (now.getTime() - new Date(lastMaint.maintainedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 180;

    const prediction = await predictMaintenance({
      totalVoyagesLast6M,
      avgFuelUsagePerVoyage,
      daysSinceLastMaint,
    });

    const maintenanceRecord = await prisma.maintenanceRecord.create({
      data: {
        shipId,
        nextDue: new Date(prediction.nextDue),
        voyageReadyDate: prediction.voyageReadyDate,
        score: prediction.score,
        description: "AI-suggested maintenance schedule",
      },
    });

    res.status(200).json({
      message: "Maintenance recommendation generated and saved",
      data: maintenanceRecord,
    });
  } catch (error: any) {
    console.error("Error generating maintenance alert:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
