const User = require("../models/User");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Popunite sva polja" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email zauzet" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    req.login(user, (err) => {
      if (err) throw err;
      res.status(201).json({ message: "Registriran", user });
    });
  } catch (error) {
    res.status(500).json({ message: "Greška servera" });
  }
};

module.exports = { registerUser };