import axios from 'axios';


export const BASE_URL = `http://192.168.1.33:3000`;
// export const BASE_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE_URL,
});

//รับ Token มาใส่แนบไปกับ axios header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        console.log(token)
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

export default api;