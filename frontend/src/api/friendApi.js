import axiosClient from './axiosClient';

export const friendApi = {
  // Pošalji zahtjev
  sendRequest: async (userId) => {
    const response = await axiosClient.post('/api/friends/request', { to: userId });
    return response.data;
  },

  // Prihvati zahtjev
  acceptRequest: async (requestId) => {
    const response = await axiosClient.post(`/api/friends/accept/${requestId}`);
    return response.data;
  },

  // Odbij zahtjev
  rejectRequest: async (requestId) => {
    const response = await axiosClient.post(`/api/friends/reject/${requestId}`);
    return response.data;
  },

  // Ukloni prijatelja (Unfriend)
  unfriend: async (friendId) => {
    const response = await axiosClient.delete(`/api/friends/unfriend/${friendId}`);
    return response.data;
  }
};