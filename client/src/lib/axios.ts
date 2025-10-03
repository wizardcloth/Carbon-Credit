import axios from 'axios';

// &Deployment
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
});

// &Production
// const axiosInstance = axios.create({
//   baseURL: 'https://carbon-credit-qovi.vercel.app/api', 
// });

export default axiosInstance;
