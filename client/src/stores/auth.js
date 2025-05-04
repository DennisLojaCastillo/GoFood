import { writable } from 'svelte/store';

// Create a writable store for the user
const user = writable(getUserFromStorage());

// Initialize from localStorage on app start
function getUserFromStorage() {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

// Function to login a user
function login(userData, token) {
  // Save to localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  
  // Update the store
  user.set(userData);
}

// Function to update user data
function updateUser(userData) {
  // Get current user data
  const currentUser = getUserFromStorage();
  
  if (currentUser) {
    // Merge new data with existing data
    const updatedUser = { ...currentUser, ...userData };
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update the store
    user.set(updatedUser);
  }
}

// Function to logout
function logout() {
  // Clear from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Update the store
  user.set(null);
}

// Listen for storage events (for multi-tab support)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'user') {
      if (event.newValue) {
        try {
          user.set(JSON.parse(event.newValue));
        } catch (e) {
          user.set(null);
        }
      } else {
        user.set(null);
      }
    }
  });
}

export { user, login, logout, updateUser }; 