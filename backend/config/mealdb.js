const axios = require("axios");

const mealDB = axios.create({
  baseURL: "https://www.themealdb.com/api/json/v1/1"
});

module.exports = mealDB;