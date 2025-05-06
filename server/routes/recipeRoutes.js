import express from 'express';
import { recipeController } from '../controllers/recipeController.js';
import { db } from '../config/db.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
const controller = recipeController(db);

router.get('/api/recipes', verifyToken, controller.getAllRecipes);
router.post('/api/recipes', verifyToken, controller.createRecipe);
router.get('/api/recipes/:id', verifyToken, controller.getRecipeById);
router.put('/api/recipes/:id', verifyToken, controller.updateRecipe);
router.delete('/api/recipes/:id', verifyToken, controller.deleteRecipe);

export default router;
