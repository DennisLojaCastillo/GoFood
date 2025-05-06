let io;
const userSocketMap = new Map();

export const messagesSocket = (server) => {
  io = server;

  io.on('connection', (socket) => {    
    socket.on('register', (userId) => {
      if (!userId) return;      
      userSocketMap.set(userId, socket.id);            
      socket.join(userId);
    });

    socket.on('disconnect', () => {
      for (const [userId, sockId] of userSocketMap.entries()) {
        if (sockId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }      
    });
  });
};
