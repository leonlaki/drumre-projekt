import axiosClient from './axiosClient';

export const playlistApi = {
  // Dohvati sve MOJE playliste
  getMyPlaylists: async () => {
    const response = await axiosClient.get('/api/playlists/playlists'); 
    // Napomena: Provjeri rutu na backendu, u playlistRoutes.js si stavio router.get("/playlists", ...)
    // Ako je mountano na /api/playlists, onda je putanja /api/playlists/playlists.
    // Ako si mountao router na /api, onda je samo /api/playlists. 
    // Pretpostavit ću standard: app.use('/api/playlists', playlistRoutes) -> pa je ruta /api/playlists/playlists
    return response.data;
  },

  // Dohvati jednu playlistu po ID-u
  getPlaylistById: async (id) => {
    const response = await axiosClient.get(`/api/playlists/playlists/${id}`);
    return response.data;
  },

  // Kreiraj novu playlistu
  createPlaylist: async (data) => {
    // data = { name, description }
    const response = await axiosClient.post('/api/playlists/playlists', data);
    return response.data;
  },

  // Dodaj pjesmu (iz Deezer pretrage) u playlistu
  addSongToPlaylist: async (playlistId, songData) => {
    // songData = { deezerId, title, artist, albumCover, previewUrl }
    const response = await axiosClient.post(`/api/playlists/playlists/${playlistId}/songs`, songData);
    return response.data;
  },

  // Obriši pjesmu iz playliste
  removeSong: async (playlistId, songId) => {
    const response = await axiosClient.delete(`/api/playlists/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },

  // Obriši cijelu playlistu
  deletePlaylist: async (playlistId) => {
    const response = await axiosClient.delete(`/api/playlists/playlists/${playlistId}`);
    return response.data;
  }
};