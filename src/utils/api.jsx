import axios from 'axios';


const DEV_API_URL = 'http://16.176.62.189:3000';
const PROD_API_URL = 'http://16.176.62.189:3000'; 


const isDev = import.meta.env.MODE === 'development';


export const BASE_URL = isDev ? DEV_API_URL : PROD_API_URL;


const api = axios.create({
  baseURL: BASE_URL,
});

console.log("🟢 RUNNING ON:", isDev ? 'development' : 'production', "| API URL:", BASE_URL);


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

/*
security group http port tcp 3000 0.0.0.0/0
elastic ip 
pm2

*/

