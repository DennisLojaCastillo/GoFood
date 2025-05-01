import { Server } from 'socket.io';

let io;
const userSocketMap = new Map(); // userId -> socketId

export const messagesSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('register', (userId) => {
      userSocketMap.set(userId, socket.id);
      console.log(`✅ Registered user ${userId} on socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, sockId] of userSocketMap.entries()) {
        if (sockId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
      console.log('❌ Client disconnected:', socket.id);
    });
  });
};
