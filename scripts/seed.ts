import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Fuel cost per liter (as per your comments)
const FUEL_COSTS = {
  petrol: 105,
  diesel: 90,
};

const FUEL_TYPES = ["petrol", "diesel"];
const CARGO_TYPES = ["container", "bulk", "liquid", "general", "refrigerated"];

// Helper function to round to 2 decimal places
const round2 = (num: number) => Math.round(num * 100) / 100;

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing data
  await prisma.voyageFeedback.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.voyage.deleteMany();
  await prisma.ship.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log("👤 Creating users...");
  const users = await Promise.all(
    Array.from({ length: 5 }, async () => {
      return await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      });
    })
  );

  // Create Ships - realistic cargo ship specs
  console.log("🚢 Creating ships...");
  const ships = await Promise.all(
    users.flatMap((user) =>
      Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, async () => {
        return await prisma.ship.create({
          data: {
            name: `${faker.word.adjective()} ${faker.helpers.arrayElement([
              "Cargo",
              "Navigator",
              "Merchant",
              "Voyager",
              "Trader",
            ])}`,
            capacity: faker.number.int({ min: 15000, max: 80000 }), // Realistic cargo ship capacity in tons
            userId: user.id,
          },
        });
      })
    )
  );

  // Create Voyages with related data
  console.log("⛵ Creating voyages...");
  for (const ship of ships) {
    const numVoyages = faker.number.int({ min: 2, max: 5 });

    for (let i = 0; i < numVoyages; i++) {
      const departureDate = faker.date.past({ years: 1 });

      // Realistic cargo ship voyage distances (500km - 8000km for regional/international routes)
      const distance = round2(
        faker.number.float({ min: 500, max: 8000, fractionDigits: 2 })
      );

      // Cargo weight (60-95% of ship capacity)
      const cargoWeight = round2(
        faker.number.float({
          min: ship.capacity * 0.6,
          max: ship.capacity * 0.95,
          fractionDigits: 2,
        })
      );

      // Weather conditions
      const weatherSeverity = round2(
        faker.number.float({ min: 0.2, max: 0.8, fractionDigits: 2 })
      );
      const windSpeed = round2(
        faker.number.float({ min: 8, max: 35, fractionDigits: 2 })
      );

      // AI predictions - realistic for cargo ships
      const baseSpeed = round2(
        faker.number.float({ min: 12, max: 18, fractionDigits: 2 })
      ); // Cargo ships: 12-18 knots
      const predictedDuration = round2(distance / baseSpeed); // Duration in hours
      const optimalSpeed = round2(
        faker.number.float({ min: 14, max: 20, fractionDigits: 2 })
      );

      // Fuel consumption: 2-5 tons per day for cargo ships, adjusted for distance and cargo
      const baseFuelRate = round2(
        faker.number.float({ min: 2.5, max: 4.5, fractionDigits: 2 })
      ); // tons per day
      const predictedFuelUsage = round2(
        (predictedDuration / 24) * baseFuelRate * 1000
      ); // Convert to liters (1 ton ≈ 1000L)

      const arrivalTime = new Date(
        departureDate.getTime() + predictedDuration * 3600000
      );

      const voyage = await prisma.voyage.create({
        data: {
          name: `${faker.location.city()} to ${faker.location.city()}`,
          origin: faker.location.city(),
          destination: faker.location.city(),
          distance,
          departureDate,
          arrivalTime,
          cargoWeight,
          cargoType: faker.helpers.arrayElement(CARGO_TYPES),
          weatherSeverity,
          windSpeed,
          predictedFuelUsage,
          predictedDuration,
          optimalSpeed,
          speedSchedule: {
            segments: Array.from({ length: 3 }, () => ({
              distance: round2(
                faker.number.float({ min: 100, max: 400, fractionDigits: 2 })
              ),
              speed: round2(
                faker.number.float({ min: 13, max: 19, fractionDigits: 2 })
              ),
              duration: round2(
                faker.number.float({ min: 6, max: 20, fractionDigits: 2 })
              ),
            })),
          },
          shipId: ship.id,
          userId: ship.userId,
        },
      });

      // Create FuelLogs for this voyage - realistic fuel consumption
      console.log(`⛽ Creating fuel logs for voyage ${voyage.name}...`);
      const numFuelLogs = faker.number.int({ min: 4, max: 8 });
      let totalFuelUsage = 0;

      // Generate actual fuel usage close to predicted (within 5-10% variance)
      const actualFuelTarget = round2(
        predictedFuelUsage *
          faker.number.float({ min: 0.92, max: 1.08, fractionDigits: 2 })
      );
      const fuelPerLog = actualFuelTarget / numFuelLogs;

      for (let j = 0; j < numFuelLogs; j++) {
        const fuelType = faker.helpers.arrayElement(FUEL_TYPES);
        // Distribute fuel usage with small variance
        const fuelUsage = round2(
          fuelPerLog *
            faker.number.float({ min: 0.85, max: 1.15, fractionDigits: 2 })
        );
        const fuelCost = round2(
          fuelUsage * FUEL_COSTS[fuelType as keyof typeof FUEL_COSTS]
        );

        totalFuelUsage = round2(totalFuelUsage + fuelUsage);

        await prisma.fuelLog.create({
          data: {
            timestamp: faker.date.between({
              from: departureDate,
              to: arrivalTime,
            }),
            fuelType,
            fuelUsage,
            fuelCost,
            shipId: ship.id,
            voyageId: voyage.id,
          },
        });
      }

      // Create VoyageFeedback with high accuracy (85-95.5%)
      console.log(`📊 Creating voyage feedback for ${voyage.name}...`);

      // Actual duration close to predicted (within 5-8% variance)
      const actualDuration = Math.round(
        predictedDuration *
          faker.number.float({ min: 0.94, max: 1.06, fractionDigits: 2 })
      );

      // Calculate realistic accuracy percentages (85-95.5%)
      const fuelAccuracy = round2(
        faker.number.float({ min: 85, max: 95.5, fractionDigits: 2 })
      );
      const durationAccuracy = round2(
        faker.number.float({ min: 85, max: 95.5, fractionDigits: 2 })
      );

      await prisma.voyageFeedback.create({
        data: {
          voyageId: voyage.id,
          actualFuelUsage: totalFuelUsage, // This matches sum of FuelLog entries
          actualDuration,
          fuelAccuracy,
          durationAccuracy,
          routeOptimizationScore: faker.number.int({ min: 7, max: 10 }), // Higher scores for realistic optimization
        },
      });
    }

    // Create MaintenanceRecords for each ship
    console.log(`🔧 Creating maintenance records for ${ship.name}...`);
    const numMaintenanceRecords = faker.number.int({ min: 1, max: 3 });

    for (let k = 0; k < numMaintenanceRecords; k++) {
      const maintainedAt = faker.date.past({ years: 2 });
      const nextDue = new Date(
        maintainedAt.getTime() +
          faker.number.int({ min: 6, max: 12 }) * 30 * 24 * 3600000
      ); // 6-12 months
      const voyageReadyDate = new Date(
        maintainedAt.getTime() +
          faker.number.int({ min: 10, max: 15 }) * 24 * 3600000
      ); // 10-15 days

      await prisma.maintenanceRecord.create({
        data: {
          maintainedAt,
          description: faker.helpers.arrayElement([
            "Main engine overhaul and inspection",
            "Hull cleaning and anti-fouling paint application",
            "Navigation and communication systems upgrade",
            "Safety equipment annual inspection",
            "Propeller shaft alignment and bearing replacement",
            "Auxiliary generator service and electrical system check",
            "Cargo hold ventilation system maintenance",
            "Ballast water treatment system service",
          ]),
          nextDue,
          voyageReadyDate,
          score: faker.number.int({ min: 3, max: 5 }), // Higher scores for well-maintained ships
          shipId: ship.id,
        },
      });
    }
  }

  // Print summary
  const userCount = await prisma.user.count();
  const shipCount = await prisma.ship.count();
  const voyageCount = await prisma.voyage.count();
  const fuelLogCount = await prisma.fuelLog.count();
  const feedbackCount = await prisma.voyageFeedback.count();
  const maintenanceCount = await prisma.maintenanceRecord.count();

  console.log("\n🎉 Seeding completed successfully!");
  console.log(`📊 Summary:`);
  console.log(`   👤 Users: ${userCount}`);
  console.log(`   🚢 Ships: ${shipCount}`);
  console.log(`   ⛵ Voyages: ${voyageCount}`);
  console.log(`   ⛽ Fuel Logs: ${fuelLogCount}`);
  console.log(`   📊 Voyage Feedback: ${feedbackCount}`);
  console.log(`   🔧 Maintenance Records: ${maintenanceCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
