import axiosClient from './axiosClient';

export const recipeApi = {
  // Dohvati recepte korisnika (za dropdown ili kuharicu)
  getUserRecipes: async (username) => {
    const response = await axiosClient.get(`/api/recipes/user/${username}`);
    return response.data;
  },

  // Spremi novi recept
  saveRecipe: async (recipeData) => {
    const response = await axiosClient.post('/api/recipes', recipeData);
    return response.data;
  },

  // NOVO: Ažuriraj postojeći
  updateRecipe: async (id, recipeData) => {
    const response = await axiosClient.put(`/api/recipes/${id}`, recipeData);
    return response.data;
  },

  // NOVO: Obriši recept
  deleteRecipe: async (id) => {
    const response = await axiosClient.delete(`/api/recipes/${id}`);
    return response.data;
  },

  // NOVO: Dohvati spremljene recepte
  getSavedRecipes: async () => {
    const response = await axiosClient.get('/api/recipes/saved');
    return response.data;
  },

  // NOVO: Spremi/Odshemi recept
  toggleSave: async (recipeId) => {
    const response = await axiosClient.post(`/api/recipes/${recipeId}/save`);
    return response.data;
  }
};