import axiosClient from "./axiosClient";

export const userApi = {
  // Dohvati javni profil bilo kojeg korisnika
  getUserProfile: async (username) => {
    const response = await axiosClient.get(`/api/users/${username}`);
    return response.data; 
  },

  // Ažuriraj MOJ profil 
  updateMyProfile: async (data) => {
    const response = await axiosClient.put("/api/users/profile", data);
    return response.data;
  },

  // Dohvati opcije za odabir 
  getOnboardingOptions: async () => {
    const response = await axiosClient.get("/api/users/onboarding/options");
    return response.data;
  },

  // Spremi korisnikove preference
  savePreferences: async (preferences) => {
    const response = await axiosClient.post(
      "/api/users/onboarding/save",
      preferences
    );
    return response.data;
  },

  // Dohvati preporuke
  getRecommendations: async () => {
    const response = await axiosClient.get(
      "/api/users/recommendations/external"
    );
    return response.data;
  },

  getPokemonList: async () => {
    const response = await axiosClient.get("/api/users/pokemon/list");
    return response.data;
  },

  // Postavi odabranog pokemona kao avatar
  setPokemonAvatar: async (pokemonId) => {
    const response = await axiosClient.post("/api/users/pokemon/select", {
      pokemonId,
    });
    return response.data;
  },

  // Pretraži korisnike po username-u
  searchUsers: async (searchTerm) => {
    const response = await axiosClient.get("/api/users/search", {
      params: { query: searchTerm },
    });
    return response.data;
  },
};
