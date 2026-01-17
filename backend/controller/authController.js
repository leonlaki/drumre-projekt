const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getRandomPokemonAvatar = require("../utils/pokemonAvatar");

// 1. REGISTRACIJA (Lokalna - email/pass)
const registerUser = async (req, res) => {
  const { name, email, password, username } = req.body;

  // Provjera: username je sada obavezan za lokalnu registraciju
  if (!name || !email || !password || !username) {
    return res
      .status(400)
      .json({ message: "Popunite sva polja (uključujući korisničko ime)" });
  }

  try {
    // Provjera postoji li već email
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email je već zauzet" });

    // Provjera postoji li već username
    let userByName = await User.findOne({ username });
    if (userByName)
      return res.status(400).json({ message: "Korisničko ime je već zauzeto" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatar = await getRandomPokemonAvatar();

    user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      avatar,
    });

    req.login(user, (err) => {
      if (err) throw err;
      res.status(201).json({ message: "Registriran", user });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška servera" });
  }
};

// 2. POSTAVLJANJE USERNAME-A (Za Google/FB korisnike)
const setUsername = async (req, res) => {
  const { username } = req.body;

  // Provjera je li korisnik logiran (middleware bi ovo trebao uhvatiti, ali za svaki slučaj)
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Niste prijavljeni." });
  }

  const userId = req.user._id;

  if (!username)
    return res.status(400).json({ message: "Username je obavezan" });

  try {
    // Provjeri je li username zauzet
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "To korisničko ime je već zauzeto." });
    }

    // Ažuriraj korisnika
    const user = await User.findByIdAndUpdate(
      userId,
      { username: username },
      { new: true }
    );

    res.json({ message: "Korisničko ime postavljeno", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri postavljanju imena" });
  }
};

module.exports = { registerUser, setUsername };
