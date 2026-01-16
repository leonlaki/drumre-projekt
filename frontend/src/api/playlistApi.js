import axiosClient from './axiosClient';

export const playlistApi = {
  // Dohvati sve MOJE playliste
  getMyPlaylists: async () => {
    // ISPRAVAK: Maknuli smo jedan "/playlists"
    const response = await axiosClient.get('/api/playlists'); 
    return response.data;
  },

  // Dohvati jednu playlistu po ID-u
  getPlaylistById: async (id) => {
    // ISPRAVAK
    const response = await axiosClient.get(`/api/playlists/${id}`);
    return response.data;
  },

  // Kreiraj novu playlistu
  createPlaylist: async (data) => {
    // data = { name, description }
    // ISPRAVAK: Ovo je bio uzrok tvog errora
    const response = await axiosClient.post('/api/playlists', data);
    return response.data;
  },

  // Dodaj pjesmu (iz Deezer pretrage) u playlistu
  addSongToPlaylist: async (playlistId, songData) => {
    // songData = { deezerId, title, artist, albumCover, previewUrl }
    // ISPRAVAK
    const response = await axiosClient.post(`/api/playlists/${playlistId}/songs`, songData);
    return response.data;
  },

  // Obriši pjesmu iz playliste
  removeSong: async (playlistId, songId) => {
    // ISPRAVAK
    const response = await axiosClient.delete(`/api/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },

  // Obriši cijelu playlistu
  deletePlaylist: async (playlistId) => {
    // ISPRAVAK
    const response = await axiosClient.delete(`/api/playlists/${playlistId}`);
    return response.data;
  }
};