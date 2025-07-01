import { Router } from "express";
import { provideFeedback } from "../controllers/feedback.controller";

const feedbackRoutes = Router();

feedbackRoutes.post("/provide-feedback", provideFeedback);

export default feedbackRoutes;
