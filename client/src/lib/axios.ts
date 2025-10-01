import axios from 'axios';

//&Deployment
// const axiosInstance = axios.create({
//   baseURL: '', 
// });

//&Production
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', 
});

export default axiosInstance;
