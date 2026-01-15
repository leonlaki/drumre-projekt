import axiosClient from './axiosClient';

export const musicApi = {
  // Pretraži Deezer (preko našeg backenda)
  searchMusic: async (query) => {
    // Poziva /api/music/search?q=query
    const response = await axiosClient.get(`/api/music/search`, {
      params: { q: query }
    });
    return response.data; // Vraća niz pjesama s previewUrl
  }
};