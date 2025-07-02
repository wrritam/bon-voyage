import { Router } from "express";
import { getMaintenanceAlert } from "../controllers/maintenance.controller";

const maintenanceRoutes = Router();

maintenanceRoutes.get("/maintenance-alerts/:shipId", getMaintenanceAlert);

export default maintenanceRoutes;
