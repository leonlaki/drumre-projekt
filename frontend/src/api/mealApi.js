import axiosClient from './axiosClient';

export const mealApi = {
  // Dohvati Feed (Trending zadnjih 7 dana)
  getFeed: async () => {
    const response = await axiosClient.get('/api/meals/feed');
    return response.data;
  },

  // Dohvati obroke specifičnog korisnika (za profil)
  getUserMeals: async (username, sort = 'popular') => {
    // sort može biti 'popular' ili 'newest'
    const response = await axiosClient.get(`/api/meals/user/${username}?sort=${sort}`);
    return response.data;
  },

  // Dohvati detalje jednog obroka
  getMealDetails: async (id) => {
    const response = await axiosClient.get(`/api/meals/${id}`);
    return response.data;
  },

  // Kreiraj novi obrok
  createMeal: async (mealData) => {
    // mealData = { title, description, courses: [...], playlistId }
    const response = await axiosClient.post('/api/meals', mealData);
    return response.data;
  },

  searchMeals: async (query, page = 1, sort = 'newest') => {
    const response = await axiosClient.get('/api/meals/search', {
      params: { query, page, limit: 20, sort }
    });
    return response.data;
  },

  // --- INTERAKCIJE ---

  commentOnMeal: async (id, text) => {
    const response = await axiosClient.post(`/api/meals/${id}/comment`, { text });
    return response.data;
  },

  rateMeal: async (id, value) => {
    // value = 1 do 5
    const response = await axiosClient.post(`/api/meals/${id}/rate`, { value });
    return response.data;
  },

  incrementViewCount: async (id) => {
    // Backend ruta je definisana kao POST /api/meals/:id/view
    const response = await axiosClient.post(`/api/meals/${id}/view`);
    return response.data;
  },

  incrementShare: async (id) => {
    await axiosClient.post(`/api/meals/${id}/share`);
  },

  getRecommendations: async () => {
    const response = await axiosClient.get('/api/meals/recommendations/internal');
    return response.data;
  },

  deleteMeal: async (id) => {
    const response = await axiosClient.delete(`/api/meals/${id}`);
    return response.data;
  },

  leaveMeal: async (id) => {
    const response = await axiosClient.post(`/api/meals/${id}/leave`);
    return response.data;
  },
};