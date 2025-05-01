// routes/userRoutes.js
import express from 'express';
import { userController } from '../controllers/userController.js';
import { db } from '../config/db.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
const controller = userController(db);

// Profile management routes
router.get('/api/user/profile', verifyToken, controller.getProfile);
router.put('/api/user/profile', verifyToken, controller.updateProfile);

// User recipes routes
router.get('/api/user/recipes', verifyToken, controller.getUserRecipes);

export default router; 