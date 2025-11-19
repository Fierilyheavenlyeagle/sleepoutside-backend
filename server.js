import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// --- Cargar productos desde products.json (ruta compatible con ESM) ---
let products = [];

function loadProducts() {
  try {
    const rawData = fs.readFileSync(
      new URL("./products.json", import.meta.url),
      "utf-8"
    );
    products = JSON.parse(rawData);
    console.log("Productos cargados:", products.length);
  } catch (err) {
    console.error("❌ Error al leer products.json:", err.message);
    products = [];
  }
}

// Cargar al inicio
loadProducts();

// Opcional: endpoint para recargar productos sin redeploy (útil en desarrollo)
app.post("/admin/reload-products", (req, res) => {
  loadProducts();
  res.json({ ok: true, length: products.length });
});

// --- Rutas de la API ---

// Ruta de estado
app.get("/health", (req, res) => {
  res.json({ status: "ok", products: products.length });
});

// Obtener todos los productos o filtrar por categoría
app.get("/api/products", (req, res) => {
  const category = req.query.category;

  if (category) {
    const filtered = products.filter((p) => {
      const cat = p.category || p.Category || "";
      return String(cat).toLowerCase() === String(category).toLowerCase();
    });
    return res.json(filtered);
  }

  res.json(products);
});

// Obtener producto por ID (soporta 'id' o 'Id' en el JSON)
app.get("/api/products/:id", (req, res) => {
  const id = String(req.params.id);

  const product = products.find((p) => {
    const pid = p.id ?? p.Id ?? p.ID ?? p.productId ?? "";
    return String(pid) === id;
  });

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(product);
});

// --- Puerto dinámico para Render ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
