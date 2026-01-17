import axiosClient from './axiosClient';

export const playlistApi = {
  // Dohvati sve MOJE playliste
  getMyPlaylists: async () => {
    const response = await axiosClient.get('/api/playlists'); 
    return response.data;
  },

  // Dohvati jednu playlistu po ID-u
  getPlaylistById: async (id) => {
    const response = await axiosClient.get(`/api/playlists/${id}`);
    return response.data;
  },

  // Kreiraj novu playlistu
  createPlaylist: async (data) => {
    const response = await axiosClient.post('/api/playlists', data);
    return response.data;
  },

  // Dodaj pjesmu
  addSongToPlaylist: async (playlistId, songData) => {
    const response = await axiosClient.post(`/api/playlists/${playlistId}/songs`, songData);
    return response.data;
  },

  // Obriši pjesmu
  removeSong: async (playlistId, songId) => {
    const response = await axiosClient.delete(`/api/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },

  // Obriši cijelu playlistu
  deletePlaylist: async (playlistId) => {
    const response = await axiosClient.delete(`/api/playlists/${playlistId}`);
    return response.data;
  }
};