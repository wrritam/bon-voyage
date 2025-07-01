import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { trainModels } from "./prediction/modelTrainer";
import authRoutes from "./routes/auth.routes";
import voyageRoutes from "./routes/voyage.route";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// train the model before the server starts
trainModels()
  .then(() => {
    console.log("Models trained successfully");
  })
  .catch((error) => {
    console.error("Error training models:", error);
  });

app.use("/auth", authRoutes);
app.use("/voyage", voyageRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "bon voyage!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
