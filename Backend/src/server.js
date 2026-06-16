require("dotenv").config();

const { execSync } = require("child_process");
const app = require("./app");
const { connectPostgreSQL } = require("./config/connection");
const { getDbModeLabel } = require("./config/database");
const { runMigrations } = require("./db/migrate");

const PORT = process.env.PORT || 5000;

function getPortBlockerPid(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
    });
    const line = output.split("\n").find((l) => l.includes("LISTENING"));
    if (!line) return null;
    const parts = line.trim().split(/\s+/);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

async function startServer() {
  try {
    await connectPostgreSQL();
    await runMigrations();
    console.log(`Connected to ${getDbModeLabel()}`);
  } catch (err) {
    console.error("PostgreSQL connection failed:", err.message);
    console.error("Check backend/.env database credentials.");
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Library API running at http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      const blockingPid = getPortBlockerPid(PORT);
      console.error(
        `Port ${PORT} is already in use${blockingPid ? ` by process PID ${blockingPid}` : ""}.`,
      );
      console.error(
        "Stop the other process (taskkill /PID <pid> /F) or change PORT in backend/.env",
      );
      process.exit(1);
    }
    throw err;
  });
}

startServer();
