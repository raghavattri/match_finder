const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const matchRoutes = require("./routes/match");
const dotenv =  require('dotenv'); 
const app = express();
const PORT = process.env.PORT || 3000;


dotenv.config();

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
