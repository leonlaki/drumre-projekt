const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors"); // <--- 1. DODAJ OVO
const connectDB = require("./config/db");

dotenv.config();
connectDB();

require("./config/passport");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,     
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.send(req.user ? `Logged in as ${req.user.name}` : "Not logged in");
});

app.use("/auth", require("./routes/authRoutes"));

app.use("/api/external", require("./routes/apiRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/meals", require("./routes/mealRoutes"));

app.use("/api/friends", require('./routes/friendRoute'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
