import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./Routes/UserRouter.js";
import moviesRouter from "./Routes/MoviesRouter.js";
import categoriesRouter from "./Routes/CategoriesRouter.js";
import Uploadrouter from "./Controllers/UploadFile.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();
//Main route
app.get("/", (req, res) => {
  res.send("API is Running....");
});
//Another routes
app.use("/api/user", userRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/upload", Uploadrouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in http://localhost/${PORT}`);
});
