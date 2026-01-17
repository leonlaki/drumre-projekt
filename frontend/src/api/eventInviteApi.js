import axiosClient from './axiosClient';

export const eventInviteApi = {
  // Dohvati moje pozivnice
  getMyInvites: async () => {
    const response = await axiosClient.get('/api/invites');
    return response.data;
  },

  // Prihvati
  acceptInvite: async (inviteId) => {
    const response = await axiosClient.post(`/api/invites/${inviteId}/accept`);
    return response.data;
  },

  // Odbij
  rejectInvite: async (inviteId) => {
    const response = await axiosClient.post(`/api/invites/${inviteId}/reject`);
    return response.data;
  }
};