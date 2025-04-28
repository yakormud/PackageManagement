import axios from 'axios';

const hostname = window.location.hostname; 
console.log(hostname);
export const BASE_URL = `http://${hostname}:3000`;

// export const BASE_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE_URL,
});

export default api;