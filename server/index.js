import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key'; // Ændre dette i produktion!

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Din Svelte app URL
  credentials: true
}));
app.use(express.json());

// Temporary user storage (erstat dette med en database i produktion)
const users = [];

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Check om bruger allerede eksisterer
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email er allerede i brug' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gem bruger (erstat dette med database i produktion)
    const user = {
      id: users.length + 1,
      email,
      fullName,
      password: hashedPassword
    };
    users.push(user);

    // Generer JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    // Send respons
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Der skete en fejl ved oprettelse af bruger' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Din Svelte app URL
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    // Disconnect handler
  });
});