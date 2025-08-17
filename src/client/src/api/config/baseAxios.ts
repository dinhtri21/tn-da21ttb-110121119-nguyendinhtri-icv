import axios from "axios";

const baseAxios = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API}/api/`, 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

baseAxios.interceptors.request.use(
  (config) => {
    const tokenData = localStorage.getItem("authToken");
    if (tokenData) {
      config.headers.Authorization = `Bearer ${tokenData}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default baseAxios;
