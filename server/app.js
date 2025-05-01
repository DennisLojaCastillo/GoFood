// app.js
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import http from 'http';
import fs from 'fs';
import path from 'path';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';  
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const server = http.createServer(app);

import { messagesSocket } from './utils/socketsUtil.js';
messagesSocket(server); // Starter Socket.io


// Connect to DB
connectDB();

// Create uploads directory if not exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {  
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Enhanced CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Add your frontend URL(s)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS settings
app.use(cors(corsOptions));

// For uploads folder, disable browser cache control headers
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

// Log requests to uploads folder for debugging
app.use('/uploads', (req, res, next) => {  
  next();
});

// Other middleware
app.use(express.json());
app.use(cookieParser());

// Configure Helmet with relaxed settings for images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Routes 
app.use(authRoutes);
app.use(recipeRoutes);
app.use(adminRoutes);
app.use(uploadRoutes); // aktiver upload-route
app.use(userRoutes); // User routes for profile, favorites, etc.

// Server
const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
