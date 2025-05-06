// routes/userRoutes.js
import express from 'express';
import { userController } from '../controllers/userController.js';
import { db } from '../config/db.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
const controller = userController(db);

router.get('/api/user/profile', verifyToken, controller.getProfile);
router.put('/api/user/profile', verifyToken, controller.updateProfile);

router.get('/api/user/recipes', verifyToken, controller.getUserRecipes);
router.get('/api/user/favorites', verifyToken, controller.getUserFavorites);
router.post('/api/user/favorites', verifyToken, controller.updateFavorites);

export default router; 