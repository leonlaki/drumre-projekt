const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const connectDB = require("./config/db");
const musicRoutes = require("./routes/musicRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const eventInviteRoutes = require("./routes/eventInviteRoutes");

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
      maxAge: 1000 * 60 * 60 * 2,
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

app.use("/api", require("./routes/playlistRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/meals", require("./routes/mealRoutes"));
app.use("/api/music", musicRoutes);

app.use("/api/friends", require("./routes/friendRoute"));
app.use("/api/mealdb", require("./routes/mealdbRoutes"));
app.use("/api/invites", eventInviteRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
