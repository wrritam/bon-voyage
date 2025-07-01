import { Router } from "express";
import { planVoyage } from "../controllers/voyage.controller";

const voyageRoutes = Router();

voyageRoutes.post("/plan-voyage", planVoyage);

export default voyageRoutes;
