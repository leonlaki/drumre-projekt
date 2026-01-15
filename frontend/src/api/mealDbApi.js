import axiosClient from './axiosClient';

export const mealDbApi = {
  // Kombinirana pretraga (ime, kategorija, područje)
  search: async ({ name, category, area }) => {
    const response = await axiosClient.get('/api/mealdb/search', {
      params: { name, category, area }
    });
    return response.data; // Vraća niz jela
  },

  // Dohvati listu svih kategorija (Beef, Chicken...)
  getCategories: async () => {
    const response = await axiosClient.get('/api/mealdb/categories');
    return response.data;
  },

  // Dohvati listu svih područja (Italian, Croatian...)
  getAreas: async () => {
    const response = await axiosClient.get('/api/mealdb/areas');
    return response.data;
  }
};