const express = require("express");
const dotenv =  require('dotenv'); 
dotenv.config();

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const matchRoutes = require("./routes/match");
const connectionRoutes = require("./routes/connections");
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const defaultLocalOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (defaultLocalOrigins.includes(origin)) return true;

  try {
    const { hostname, protocol } = new URL(origin);
    return (
      protocol === "https:" &&
      (hostname === "matchfinder-ui.vercel.app" || hostname.endsWith(".vercel.app"))
    );
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'MERN App Backend',
    endpoints: {
      health: '/api/health',
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running!' });
});


app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/connections", connectionRoutes);

// Backward-compatible aliases for deployments accidentally configured without `/api`.
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/matches", matchRoutes);
app.use("/connections", connectionRoutes);

const url = process.env.MONGODB_URL;

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
  console.error("FULL ERROR:", error);
});

app.listen(PORT, () => {
  console.log("server is running");
});
