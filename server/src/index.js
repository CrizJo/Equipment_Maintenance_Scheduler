import "dotenv/config";
import express from "express";
import cors from "cors";
import { attachRole } from "./middleware/role.js";
import equipmentRouter from "./routes/equipment.js";
import maintenanceRouter from "./routes/maintenance.js";
import dashboardRouter from "./routes/dashboard.js";
import searchRouter from "./routes/search.js";
import techniciansRouter from "./routes/technicians.js";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(attachRole);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "EquipSync API" });
});

app.use("/api/equipment", equipmentRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/search", searchRouter);
app.use("/api/technicians", techniciansRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error" });
});

app.listen(port, () => {
  console.log(`EquipSync API listening on http://localhost:${port}`);
});
