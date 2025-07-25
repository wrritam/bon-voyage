import express from "express";
import dotenv from "dotenv";
import { trainModels } from "./prediction/modelTrainer";
import authRoutes from "./routes/auth.routes";
import voyageRoutes from "./routes/voyage.route";
import feedbackRoutes from "./routes/feedback.routes";
import maintenanceRoutes from "./routes/maintenance.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/voyage", voyageRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/maintenance", maintenanceRoutes);

app.get("/", (req, res) => {
  res.json({ message: "bon voyage!" });
});

async function inToTheSea() {
  try {
    console.log("Training AI models before server startup...");
    await trainModels();
    console.log("Models trained successfully. Starting server...");

    app.listen(PORT, () => {
      console.log(`🚢 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to train models. Server will not start.");
    console.error(error);
    process.exit(1);
  }
}

inToTheSea();
