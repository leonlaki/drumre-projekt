import axiosClient from './axiosClient';

export const mealDbApi = {
  // Kombinirana pretraga
  search: async ({ name, category, area }) => {
    const response = await axiosClient.get('/api/mealdb/search', {
      params: { name, category, area }
    });
    return response.data; 
  },

  // Dohvati listu svih kategorija 
  getCategories: async () => {
    const response = await axiosClient.get('/api/mealdb/categories');
    return response.data;
  },

  // Dohvati listu svih područja 
  getAreas: async () => {
    const response = await axiosClient.get('/api/mealdb/areas');
    return response.data;
  }
};