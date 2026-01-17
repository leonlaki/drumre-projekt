// src/api/authApi.js
import axiosClient from './axiosClient';

export const authApi = {
  // 1. Registracija
  register: async (userData) => {
    // userData = { name, email, username, password }
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  // 2. Login
  login: async (credentials) => {
    // credentials = { username, password }
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },

  // 3. Logout
  logout: async () => {
    const response = await axiosClient.get('/auth/logout');
    return response.data;
  },

  // 4. Dohvati trenutnog usera (Check Session)
  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get('/auth/user');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};