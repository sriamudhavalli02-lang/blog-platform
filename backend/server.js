const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Routes
app.use("/api/auth", authRoutes);

// Blog Post Routes
app.use("/api/posts", postRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "Blog Platform API is running successfully 🚀",
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error(
      "❌ MongoDB Connection Failed:",
      error.message
    );
  });

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Blog Platform Server running on http://localhost:${PORT}`
  );
});