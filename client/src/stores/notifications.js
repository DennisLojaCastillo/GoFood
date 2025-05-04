import { writable } from 'svelte/store';

// Function to retrieve notifications from localStorage
function getNotificationsFromStorage() {
  if (typeof window !== 'undefined') {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        return JSON.parse(storedNotifications);
      } catch (e) {
        return { items: [], unreadCount: 0 };
      }
    }
  }
  return { items: [], unreadCount: 0 };
}

// Create a writable store with notifications
const notificationStore = writable(getNotificationsFromStorage());

// Function to save notifications to localStorage
function saveNotificationsToStorage(state) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('notifications', JSON.stringify(state));
  }
}

// Svelte store with custom methods
export const notifications = {
  subscribe: notificationStore.subscribe,

// Function to add a new notification
  addNotification: (message) => {
    notificationStore.update(state => {
      const newState = {
        items: [{ message, read: false, timestamp: new Date().toISOString() }, ...state.items],
      unreadCount: state.unreadCount + 1
    };
      saveNotificationsToStorage(newState);
      return newState;
  });
  },
  
  // Function to mark a specific notification as read
  markAsRead: (index) => {
    notificationStore.update(state => {
      // Create a copy of the items array
      const items = [...state.items];
      
      // If the notification is already read, do nothing
      if (items[index] && items[index].read) return state;
      
      // Mark the notification as read
      if (items[index]) {
        items[index] = { ...items[index], read: true };
      }
      
      // Count unread notifications again
      const unreadCount = items.filter(item => !item.read).length;
      
      const newState = { items, unreadCount };
      saveNotificationsToStorage(newState);
      return newState;
    });
  },

// Function to mark all notifications as read
  markAllAsRead: () => {
    notificationStore.update(state => {
      const items = state.items.map(item => ({ ...item, read: true }));
      const newState = { items, unreadCount: 0 };
      saveNotificationsToStorage(newState);
      return newState;
    });
  },
  
  // Function to remove a notification
  removeNotification: (index) => {
    notificationStore.update(state => {
      const items = state.items.filter((_, i) => i !== index);
      const unreadCount = items.filter(item => !item.read).length;
      const newState = { items, unreadCount };
      saveNotificationsToStorage(newState);
      return newState;
    });
  },
  
  // Property to get the number of unread notifications
  get unreadCount() {
    let count = 0;
    notificationStore.subscribe(state => {
      count = state.unreadCount;
    })();
    return count;
  },
  
  // Property to get all notifications
  get items() {
    let items = [];
    notificationStore.subscribe(state => {
      items = state.items;
    })();
    return items;
  }
}; 