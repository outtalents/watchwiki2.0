import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/nodes", async (req, res) => {
    try {
      const dataPath = path.join(process.cwd(), 'src', 'data', 'nodes.json');
      const data = await fs.readFile(dataPath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      console.error("Error reading nodes:", error);
      res.status(500).json({ error: "Failed to read nodes" });
    }
  });

  app.post("/api/save", async (req, res) => {
    try {
      const { nodes } = req.body;
      if (!nodes || !Array.isArray(nodes)) {
        return res.status(400).json({ error: "Invalid nodes data" });
      }
      const dataPath = path.join(process.cwd(), 'src', 'data', 'nodes.json');
      await fs.writeFile(dataPath, JSON.stringify(nodes, null, 2), 'utf-8');
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving nodes:", error);
      res.status(500).json({ error: "Failed to save nodes" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
