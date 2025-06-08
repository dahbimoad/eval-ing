import axios from "axios";
import Cookies from "js-cookie";

// Debug: Log environment variables
console.log('🔧 Environment Variables Check:');
console.log('VITE_Question_URL:', import.meta.env.VITE_Question_URL);
console.log('All env vars:', import.meta.env);

const qApi = axios.create({
  // VITE_QUESTIONNAIRE_API_URL must be set in .env
  baseURL: import.meta.env.VITE_Question_URL
});

// Debug: Log the created API instance
console.log('🔧 API Instance Created:');
console.log('Base URL:', qApi.defaults.baseURL);

qApi.interceptors.request.use(cfg => {
  console.log('🔧 Making API Request:', cfg.method?.toUpperCase(), cfg.url);
  console.log('🔧 Full URL:', `${cfg.baseURL}${cfg.url}`);
  
  const tk = Cookies.get("accessToken");
  if (tk) {
    cfg.headers.Authorization = `Bearer ${tk}`;
    console.log('🔧 Auth token found and added');
  } else {
    console.log('🔧 No auth token found');
  }
  return cfg;
});

qApi.interceptors.response.use(
  response => {
    console.log('✅ API Response Success:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ API Response Error:', error.response?.status, error.config?.url);
    console.error('❌ Error details:', error.response?.data);
    return Promise.reject(error);
  }
);

export default qApi;
