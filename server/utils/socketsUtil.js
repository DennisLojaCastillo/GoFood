import { Server } from 'socket.io';

let io;
const userSocketMap = new Map(); // userId -> socketId

export const messagesSocket = (server) => {
  io = server;

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('register', (userId) => {
      if (!userId) return;
      
      // Gem brugerens socket ID i map
      userSocketMap.set(userId, socket.id);
      
      // Tilføj brugeren til en room med bruger-ID'et
      socket.join(userId);
      
      console.log(`✅ Registered user ${userId} on socket ${socket.id}`);
      console.log(`✅ User added to room: ${userId}`);
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

// Export userSocketMap for debugging purposes
export { userSocketMap };
