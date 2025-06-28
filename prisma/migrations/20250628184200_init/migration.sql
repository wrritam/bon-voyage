/*
  Warnings:

  - You are about to drop the column `cost` on the `fuel_logs` table. All the data in the column will be lost.
  - You are about to drop the column `fuelQuantity` on the `fuel_logs` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `fuel_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `fuel_logs` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `maintenance_records` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `maintenance_records` table. All the data in the column will be lost.
  - You are about to drop the column `engine` on the `ships` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `voyage_feedback` table. All the data in the column will be lost.
  - You are about to drop the column `totalScoreOfVoyage` on the `voyage_feedback` table. All the data in the column will be lost.
  - You are about to drop the column `actualDuration` on the `voyages` table. All the data in the column will be lost.
  - You are about to drop the column `actualFuel` on the `voyages` table. All the data in the column will be lost.
  - You are about to drop the column `deviations` on the `voyages` table. All the data in the column will be lost.
  - You are about to drop the column `predictedFuel` on the `voyages` table. All the data in the column will be lost.
  - Added the required column `fuelCost` to the `fuel_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fuelUsage` to the `fuel_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `voyages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fuel_logs" DROP COLUMN "cost",
DROP COLUMN "fuelQuantity",
DROP COLUMN "notes",
DROP COLUMN "userId",
ADD COLUMN     "fuelCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fuelUsage" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "maintenance_records" DROP COLUMN "cost",
DROP COLUMN "userId",
ADD COLUMN     "voyageReadyDate" TIMESTAMP(3),
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ships" DROP COLUMN "engine";

-- AlterTable
ALTER TABLE "voyage_feedback" DROP COLUMN "notes",
DROP COLUMN "totalScoreOfVoyage",
ADD COLUMN     "actualDuration" INTEGER,
ADD COLUMN     "actualFuelUsage" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "voyages" DROP COLUMN "actualDuration",
DROP COLUMN "actualFuel",
DROP COLUMN "deviations",
DROP COLUMN "predictedFuel",
ADD COLUMN     "predictedFuelUsage" DOUBLE PRECISION,
ADD COLUMN     "speedSchedule" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
