import axiosClient from "./axiosClient";

export const friendApi = {
  // Dohvati moje prijatelje
  getMyFriends: async () => {
    const response = await axiosClient.get("/api/friends");
    return response.data;
  },

  // Dohvati zahtjeve za prijateljstvo (Pending) 
  getPendingRequests: async () => {
    const response = await axiosClient.get("/api/friends/requests");
    return response.data;
  },

  // Pošalji zahtjev
  sendRequest: async (userId) => {
    const response = await axiosClient.post("/api/friends/request", {
      to: userId,
    });
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
    const response = await axiosClient.delete(
      `/api/friends/unfriend/${friendId}`
    );
    return response.data;
  },

  cancelRequest: async (userId) => {
    const response = await axiosClient.delete(`/api/friends/cancel/${userId}`);
    return response.data;
  },

  // Dohvati ljude kojima sam poslao zahtjev
  getSentRequests: async () => {
    const response = await axiosClient.get("/api/friends/sent");
    return response.data;
  },
};
