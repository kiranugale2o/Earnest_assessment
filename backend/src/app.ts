import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

const app = express();

app.use(helmet());

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.get("/", (_, res) =>
  res.json({ message: "Welcome to the Task Management API" }),
);

app.use((_, res) => res.status(404).json({ message: "Route not found" }));

export default app;
