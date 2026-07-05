import app from "./app";
import "dotenv/config";
import config from "./config";
import { prisma } from "./lib/prisma";

// const PORT = process.env.PORT || 5000;
const PORT = config.port;

// Global error handlers
process.on("unhandledRejection", (reason: any) => {
  console.error("[FATAL ERROR] Unhandled Rejection:", reason);
  if (reason instanceof Error) {
    console.error("Error message:", reason.message);
    console.error("Stack:", reason.stack);
  }
});

process.on("uncaughtException", (error: Error) => {
  console.error("[FATAL ERROR] Uncaught Exception:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
});

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
