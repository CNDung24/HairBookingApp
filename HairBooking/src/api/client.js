// src/api/client.js
import axios from 'axios';
import { Platform } from 'react-native';
import { Storage } from '../utils/storage';

const BASE_URL = 'http://127.0.0.1:5000/api';

const client = axios.create({ 
    baseURL: BASE_URL,
    timeout: 10000
});

// Log requests
client.interceptors.request.use(async (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    const token = await Storage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Log responses
client.interceptors.response.use(
    response => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    error => {
        console.log('API Error:', error.message, error.config?.url);
        return Promise.reject(error);
    }
);

export default client;