const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const matchRoutes = require("./routes/match");
const connectionRoutes = require("./routes/connections");
const dotenv =  require('dotenv'); 
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;


dotenv.config();

app.use(cors({
  origin: "http://localhost:5173", // Default Vite port
  credentials: true
}));

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
