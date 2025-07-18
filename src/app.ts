import express from "express";
import authRoute from "./routes/auth";
import { corsMiddleware } from "./middlewares/cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(corsMiddleware);

app.use("/api/v1/auth/", authRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} ✅`);
});