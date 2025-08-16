// utils/auth.js

// Store auth data
export const setAuthData = (token, user) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
  }
};

// Get auth token
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

// Get user data
export const getUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getUser();
  return !!(token && user);
};

// Clear auth data (logout)
export const clearAuthData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }
};

// Get authorization headers for API calls
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
};

// Logout function
export const logout = () => {
  clearAuthData();
  // Redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = "/signin";
  }
};
