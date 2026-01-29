import express from "express";
import cors from "cors";
import documentRoutes from "./src/routes/document.routes.js";

const app = express();
app.use(cors());

app.use("/api/documents", documentRoutes);

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Backend running on port 5000");
});
