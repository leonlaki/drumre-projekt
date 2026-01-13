// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000', // Tvoj backend URL
  withCredentials: true, // KLJUČNO: Omogućuje slanje kolačića (sesije)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;