import axiosClient from './axiosClient';

export const musicApi = {
  // Pretraži Deezer 
  searchMusic: async (query) => {
    const response = await axiosClient.get(`/api/music/search`, {
      params: { q: query }
    });
    return response.data; // Vraća niz pjesama s previewUrl
  }
};