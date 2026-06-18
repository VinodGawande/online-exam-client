export const getStoredUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getStoredRole = () => {
  return localStorage.getItem("role") || getStoredUser()?.role || "student";
};

export const isUserLoggedIn = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};

export const loginUser = (user) => {
  localStorage.setItem("isLoggedIn", "true");
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role || "student");
  }
};

export const logoutUser = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
};

export const getDefaultRouteForRole = (role) => {
  if (role === "teacher") return "/teacher";
  if (role === "admin") return "/";
  return "/dashboard";
};
