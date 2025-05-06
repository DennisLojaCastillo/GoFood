import bcrypt from 'bcrypt';
import UserModel from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

export const authController = (db) => {
  const User = UserModel(db);

  const signup = async (req, res) => {
    const { name, email, password, role = 'user' } = req.body; 

    const existingUser = await User.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const userId = await User.createUser({ name, email, password, role });
    res.status(201).json({ message: 'User created successfully', userId });
  };

  const login = async (req, res) => {
    const { email, password } = req.body;  
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid login credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid login credentials' });

    const token = generateToken(user);
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id.toString(), 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  };

  return { signup, login };
};