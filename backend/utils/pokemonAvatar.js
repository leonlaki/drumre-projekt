const axios = require("axios");

const getRandomPokemonAvatar = async () => {
  const randomId = Math.floor(Math.random() * 649) + 1;

  const { data } = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${randomId}`
  );

  // Black / White animated sprite
  const avatar =
    data.sprites?.versions?.["generation-v"]?.["black-white"]?.animated
      ?.front_default;

  return avatar || null;
};

module.exports = getRandomPokemonAvatar;