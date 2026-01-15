import axiosClient from './axiosClient';

export const recipeApi = {
  // Dohvati recepte korisnika (za dropdown ili kuharicu)
  getUserRecipes: async (username) => {
    const response = await axiosClient.get(`/api/recipes/user/${username}`);
    return response.data;
  },

  // Spremi novi recept
  saveRecipe: async (recipeData) => {
    // recipeData = { title, instructions, ingredients, category... }
    const response = await axiosClient.post('/api/recipes', recipeData);
    return response.data;
  },

  // Ažuriraj recept
  updateRecipe: async (id, recipeData) => {
    const response = await axiosClient.put(`/api/recipes/${id}`, recipeData);
    return response.data;
  },

  // Obriši recept
  deleteRecipe: async (id) => {
    const response = await axiosClient.delete(`/api/recipes/${id}`);
    return response.data;
  }
};