import { writable } from 'svelte/store';

// Funktion til at hente notifikationer fra localStorage
function getNotificationsFromStorage() {
  if (typeof window !== 'undefined') {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        return JSON.parse(storedNotifications);
      } catch (e) {
        console.error('Could not parse notifications from localStorage', e);
      }
    }
  }
  return { items: [], unreadCount: 0 };
}

// Opretter en writable store med notifikationer
const notificationStore = writable(getNotificationsFromStorage());

// Funktion til at gemme notifikationer i localStorage
function saveNotificationsToStorage(state) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('notifications', JSON.stringify(state));
  }
}

// Svelte store med custom metoder
export const notifications = {
  subscribe: notificationStore.subscribe,
  
  // Funktion til at tilføje en ny notifikation
  addNotification: (message) => {
    console.log('Adding notification:', message);
    notificationStore.update(state => {
      const newState = {
        items: [{ message, read: false, timestamp: new Date().toISOString() }, ...state.items],
        unreadCount: state.unreadCount + 1
      };
      saveNotificationsToStorage(newState);
      return newState;
    });
  },
  
  // Funktion til at markere en specifik notifikation som læst
  markAsRead: (index) => {
    notificationStore.update(state => {
      // Opret en kopi af items array
      const items = [...state.items];
      
      // Hvis notifikationen allerede er læst, gør intet
      if (items[index] && items[index].read) return state;
      
      // Markér notifikationen som læst
      if (items[index]) {
        items[index] = { ...items[index], read: true };
      }
      
      // Tæl ulæste notifikationer igen
      const unreadCount = items.filter(item => !item.read).length;
      
      const newState = { items, unreadCount };
      saveNotificationsToStorage(newState);
      return newState;
    });
  },
  
  // Funktion til at markere alle notifikationer som læst
  markAllAsRead: () => {
    notificationStore.update(state => {
      const items = state.items.map(item => ({ ...item, read: true }));
      const newState = { items, unreadCount: 0 };
      saveNotificationsToStorage(newState);
      return newState;
    });
  },
  
  // Funktion til at fjerne en notifikation
  removeNotification: (index) => {
    notificationStore.update(state => {
      const items = state.items.filter((_, i) => i !== index);
      const unreadCount = items.filter(item => !item.read).length;
      const newState = { items, unreadCount };
      saveNotificationsToStorage(newState);
      return newState;
    });
  },
  
  // Egenskab til at få antallet af ulæste notifikationer
  get unreadCount() {
    let count = 0;
    notificationStore.subscribe(state => {
      count = state.unreadCount;
    })();
    return count;
  },
  
  // Egenskab til at få alle notifikationer
  get items() {
    let items = [];
    notificationStore.subscribe(state => {
      items = state.items;
    })();
    return items;
  }
}; 