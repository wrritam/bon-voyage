import { faker } from "@faker-js/faker";
import prisma from "../src/configs/db";

async function main() {
  const USERS_COUNT = 10;
  const SHIPS_PER_USER = 2;
  const VOYAGES_PER_SHIP = 3;
  const FUEL_LOGS_PER_VOYAGE = 2;
  const MAINTENANCE_RECORDS_PER_SHIP = 2;

  for (let i = 0; i < USERS_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password(),
      },
    });

    for (let j = 0; j < SHIPS_PER_USER; j++) {
      const ship = await prisma.ship.create({
        data: {
          name: faker.vehicle.vehicle(),
          engine: faker.vehicle.type(),
          capacity: faker.number.int({ min: 100, max: 1000 }),
          userId: user.id,
        },
      });

      // Maintenance records
      for (let m = 0; m < MAINTENANCE_RECORDS_PER_SHIP; m++) {
        await prisma.maintenanceRecord.create({
          data: {
            description: faker.lorem.sentence(),
            cost: faker.number.float({ min: 1000, max: 10000 }),
            score: faker.number.int({ min: 50, max: 100 }),
            shipId: ship.id,
            userId: user.id,
            nextDue: faker.date.future(),
          },
        });
      }

      for (let k = 0; k < VOYAGES_PER_SHIP; k++) {
        const departureDate = faker.date.recent({ days: 30 });
        const arrivalTime = faker.date.soon({
          days: 5,
          refDate: departureDate,
        });

        const voyage = await prisma.voyage.create({
          data: {
            name: faker.word.words(2),
            origin: faker.location.city(),
            destination: faker.location.city(),
            departureDate,
            arrivalTime,
            distance: faker.number.float({ min: 100, max: 10000 }),
            cargoWeight: faker.number.float({ min: 1000, max: 50000 }),
            cargoType: faker.commerce.product(),
            weatherSeverity: faker.number.float({ min: 0, max: 10 }),
            windSpeed: faker.number.float({ min: 0, max: 100 }),
            predictedFuel: faker.number.float({ min: 100, max: 1000 }),
            predictedDuration: faker.number.float({ min: 5, max: 100 }),
            optimalSpeed: faker.number.float({ min: 10, max: 40 }),
            actualFuel: faker.number.float({ min: 100, max: 1000 }),
            actualDuration: faker.number.float({ min: 5, max: 100 }),
            deviations: faker.lorem.sentence(),
            shipId: ship.id,
            userId: user.id,
          },
        });

        // Fuel logs
        for (let f = 0; f < FUEL_LOGS_PER_VOYAGE; f++) {
          await prisma.fuelLog.create({
            data: {
              fuelType: faker.helpers.arrayElement([
                "diesel",
                "biodiesel",
                "petrol",
              ]),
              fuelQuantity: faker.number.float({ min: 100, max: 500 }),
              cost: faker.number.float({ min: 5000, max: 20000 }),
              notes: faker.lorem.sentence(),
              shipId: ship.id,
              voyageId: voyage.id,
              userId: user.id,
            },
          });
        }

        // Voyage feedback
        await prisma.voyageFeedback.create({
          data: {
            voyageId: voyage.id,
            fuelAccuracy: faker.number.float({ min: 70, max: 100 }),
            durationAccuracy: faker.number.float({ min: 70, max: 100 }),
            routeOptimizationScore: faker.number.int({ min: 50, max: 100 }),
            totalScoreOfVoyage: faker.number.int({ min: 50, max: 100 }),
            notes: faker.lorem.sentences(2),
          },
        });
      }
    }
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
