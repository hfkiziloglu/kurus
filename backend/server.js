require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

const authRouter         = require("./routes/auth");
const transactionsRouter = require("./routes/transactions");
const statsRouter        = require("./routes/stats");
const aiRouter           = require("./routes/ai");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth",         authRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/stats",        statsRouter);
app.use("/api/ai",           aiRouter);

app.get("/", (req, res) => res.json({ status: "ok", app: "Kuruş API" }));

app.use((req, res) => res.status(404).json({ error: "Endpoint bulunamadı." }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Kuruş API → http://localhost:${port}`));
  })
  .catch(err => {
    console.error("MongoDB bağlantı hatası:", err.message);
    process.exit(1);
  });
