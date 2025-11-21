// src/auth.js

const TOKEN_KEY = "cms_access_token";
const REMEMBER_KEY = "cms_remember_me";

export function setToken(token, rememberMe) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_KEY, "true");
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch (err) {
    console.error("Error setting token:", err);
  }
}

export function getToken() {
  try {
    // Prefer sessionStorage
    let token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        // If token found in localStorage, sync to session
        sessionStorage.setItem(TOKEN_KEY, token);
      }
    }
    return token;
  } catch (err) {
    console.error("Error getting token:", err);
    return null;
  }
}

export function isRemembered() {
  try {
    return localStorage.getItem(REMEMBER_KEY) === "true";
  } catch {
    return false;
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  } catch (err) {
    console.error("Error clearing token:", err);
  }
}
