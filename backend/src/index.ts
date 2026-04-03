import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "./data-source";
import app from "./app";

const PORT = parseInt(process.env.PORT || "5000", 10);

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected & synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
