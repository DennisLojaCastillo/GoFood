// app.js
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { Server } from 'socket.io';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';  
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST']
  }
});

import { messagesSocket } from './utils/socketsUtil.js';
messagesSocket(io);

connectDB();

const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {  
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static('uploads', {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store');
  }
}));

app.use(express.json());
app.use(cookieParser());

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Routes 
app.use(authRoutes);
app.use(recipeRoutes);
app.use(adminRoutes);
app.use(uploadRoutes); 
app.use(userRoutes); 

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {  
  console.log(`Server kører på port ${PORT}`);
});

export { io };
