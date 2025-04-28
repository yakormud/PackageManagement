import axios from 'axios';

const hostname = window.location.hostname; 
console.log(hostname);
export const BASE_URL = `http://192.168.1.35:3000`;

// export const BASE_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE_URL,
});

export default api;