const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // Ako je logiran, pusti ga dalje
  }

  // Ako nije logiran, prekini zahtjev i vrati grešku
  res
    .status(401)
    .json({ message: "Morate biti prijavljeni da biste izvršili ovu radnju." });
};

module.exports = { ensureAuth };
