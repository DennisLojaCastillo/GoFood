import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { db } from '../config/db.js';
import { ObjectId } from 'mongodb';


const router = express.Router();

router.get('/api/admin/users', verifyToken, isAdmin, async (req, res) => {
  const users = await db.collection('users').find({}).project({ password: 0 }).toArray();
  res.status(200).json(users);
});

router.get('/api/admin/overview', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    const recipes = await db.collection('recipes').find({}).toArray();

    const totalUsers = users.length;
    const totalRecipes = recipes.length;

    // Find the latest created user (based on ObjectId)
    const latestUser = users
      .map(u => ({
        name: u.name,
        email: u.email,
        createdAt: u._id.getTimestamp()
      }))
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    res.status(200).json({
      totalUsers,
      totalRecipes,
      latestUser
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching overview data' });
  }
});

router.get('/api/admin/users-with-recipes', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await db.collection('users').find({}).project({ password: 0 }).toArray();
    const recipes = await db.collection('recipes').find({}).toArray();

    const result = users.map(user => {
      const userRecipes = recipes.filter(recipe => recipe.createdBy === user._id.toString());
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        recipeCount: userRecipes.length
      };
    });

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching user list with recipe count' });
  }
});

router.delete('/api/admin/users/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  // Admin cannot delete themselves
  if (req.user.id === id) {
    return res.status(403).json({ message: 'You cannot delete your own admin account' });
  }

  // Delete the user
  const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'User not found or already deleted' });
  }

  // Delete all recipes created by this user
  await db.collection('recipes').deleteMany({ createdBy: id });

  res.status(200).json({ message: 'User and their recipes deleted successfully' });
});

router.get('/api/admin/recipes', verifyToken, isAdmin, async (req, res) => {
  try {
    const recipes = await db.collection('recipes').find({}).toArray();
    const users = await db.collection('users').find({}).project({ password: 0 }).toArray();
    
    // Map user data to recipe data
    const recipesWithUserData = await Promise.all(recipes.map(async (recipe) => {
      const user = users.find(u => u._id.toString() === recipe.createdBy);
      
      return {
        _id: recipe._id.toString(),
        title: recipe.title,
        createdBy: recipe.createdBy,
        createdByName: user ? user.name : 'Unknown user',
        createdByEmail: user ? user.email : 'N/A',
        favoritesCount: recipe.favoritesCount || 0,
        imageUrl: recipe.imageUrl || null,
        createdAt: recipe._id.getTimestamp()
      };
    }));
    
    // Sort by newest first
    recipesWithUserData.sort((a, b) => b.createdAt - a.createdAt);
    
    res.status(200).json(recipesWithUserData);
  } catch (error) {
    console.error('Error fetching recipes with user data:', error);
    res.status(500).json({ message: 'Error fetching recipes' });
  }
});

router.delete('/api/admin/recipes/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid recipe ID' });
  }

  // Delete the recipe
  const result = await db.collection('recipes').deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Recipe not found or already deleted' });
  }

  res.status(200).json({ message: 'Recipe deleted successfully' });
});

export default router;
