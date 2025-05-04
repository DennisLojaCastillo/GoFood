import { mount } from 'svelte'
import './styles/global.css'
import App from './App.svelte'
import 'bootstrap/dist/css/bootstrap.min.css'
import io from 'socket.io-client'
import { notifications } from './stores/notifications.js'
import { user } from './stores/auth.js'
import { get } from 'svelte/store'

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'], // Enable fallback to polling
  withCredentials: true
})

// Emit 'register' event after connecting to the server
socket.on('connect', () => {
  registerCurrentUser();
})

// Lyt efter notifikationer
socket.on('notification', (data) => {
  notifications.addNotification(data.message);
})

// Funktion til at registrere den nuværende bruger
function registerCurrentUser() {
  const currentUser = get(user);
  if (currentUser && currentUser.id) {
    socket.emit('register', currentUser.id);
  }
}

// Abonner på brugerbutikken for at opdage login/logout
user.subscribe(currentUser => {
  if (socket.connected) {
    if (currentUser && currentUser.id) {
      socket.emit('register', currentUser.id);
    }
  }
});

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
