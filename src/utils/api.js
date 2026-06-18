const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? "https://online-exam-api.onrender.com" : "http://localhost:5000");

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export default API_BASE_URL;
