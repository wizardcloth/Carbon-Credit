import axios from 'axios';

// &Deployment
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', 
});

//&Production
// const axiosInstance = axios.create({
//   baseURL: 'https://carbon-credit-qovi.vercel.app/api', 
// });

export default axiosInstance;
