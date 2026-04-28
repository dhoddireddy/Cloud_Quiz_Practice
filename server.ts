import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes - Private Logic
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    const validUsername = process.env.TEAM_USERNAME;
    const validPassword = process.env.TEAM_PASSWORD;

    if (!validUsername || !validPassword) {
      return res.status(500).json({ error: "Server credentials not configured" });
    }

    if (username === validUsername && password === validPassword) {
      // In a real app, you'd set a secure cookie or JWT here
      return res.json({ success: true, message: "Login successful" });
    }

    res.status(401).json({ success: false, message: "Invalid credentials" });
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
