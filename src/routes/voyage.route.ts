import { Router } from "express";
import {
  planVoyage,
  planHistory,
  planHistoryByVoyageId,
} from "../controllers/voyage.controller";

const voyageRoutes = Router();

voyageRoutes.post("/plan-voyage", planVoyage);
voyageRoutes.get("/plan-history", planHistory);
voyageRoutes.get("/plan-history/:voyageId", planHistoryByVoyageId);

export default voyageRoutes;
