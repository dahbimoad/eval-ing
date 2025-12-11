import axios from "axios";
import Cookies from "js-cookie";

const qApi = axios.create({
  baseURL: import.meta.env.VITE_Question_URL
});

qApi.interceptors.request.use(cfg => {
  const tk = Cookies.get("accessToken");
  if (tk) {
    cfg.headers.Authorization = `Bearer ${tk}`;
  }
  return cfg;
});

qApi.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export default qApi;
