import axiosClient from './axiosClient';

export const userApi = {
  // Dohvati javni profil bilo kojeg korisnika
  getUserProfile: async (username) => {
    const response = await axiosClient.get(`/api/users/${username}`);
    return response.data; // Vraća { profile, stats }
  },

  // Ažuriraj MOJ profil (Bio, Location, Avatar...)
  updateMyProfile: async (data) => {
    const response = await axiosClient.put('/api/users/profile', data);
    return response.data;
  },

  // --- ONBOARDING ---
  
  // Dohvati opcije za odabir (Kategorije i Države)
  getOnboardingOptions: async () => {
    const response = await axiosClient.get('/api/users/onboarding/options');
    return response.data;
  },

  // Spremi korisnikove preferencije
  savePreferences: async (preferences) => {
    // preferences = { categories: [], areas: [] }
    const response = await axiosClient.post('/api/users/onboarding/save', preferences);
    return response.data;
  },

  // Dohvati pametne preporuke (bazirano na preferencijama)
  getRecommendations: async () => {
    const response = await axiosClient.get('/api/users/recommendations/external');
    return response.data;
  }
};