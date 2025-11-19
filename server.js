import express from "express";
import cors from "cors";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para leer JSON de forma segura
async function readJSON(relativePath) {
  try {
    const fullPath = path.join(__dirname, relativePath);
    const data = await readFile(fullPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error leyendo ${relativePath}:`, error.message);
    return []; // No rompe el servidor
  }
}

// ENDPOINTS
app.get("/api/backpacks", async (req, res) => {
  const data = await readJSON("src/json/backpacks.json");
  res.json(data);
});

app.get("/api/sleeping-bags", async (req, res) => {
  const data = await readJSON("src/json/sleeping-bags.json");
  res.json(data);
});

app.get("/api/tents", async (req, res) => {
  const data = await readJSON("src/json/tents.json");
  res.json(data);
});

// Endpoint combinado
app.get("/api/products", async (req, res) => {
  const backpacks = await readJSON("src/json/backpacks.json");
  const sleepingBags = await readJSON("src/json/sleeping-bags.json");
  const tents = await readJSON("src/json/tents.json");

  res.json([...backpacks, ...sleepingBags, ...tents]);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
