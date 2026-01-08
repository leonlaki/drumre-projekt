const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

require("./config/passport"); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.send(
    req.user
      ? `Logged in as ${req.user.name}`
      : "Not logged in"
  );
});

app.use("/auth", require("./routes/authRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});