import axios from "axios";

const baseAxios = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API}/api`, 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Thêm Interceptor để set token từ localStorage vào header Authorization
// baseAxios.interceptors.request.use(
//   (config) => {
//     const tokenData = localStorage.getItem("useS_authenticate");
//     const state = JSON.parse(tokenData!);
//     const token = state?.state?.state?.token;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`; // thêm token vào header Authorization
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default baseAxios;
