import bcrypt from 'bcrypt';
import UserModel from '../models/User.js';
import RecipeModel from '../models/Recipe.js';
import { ObjectId } from 'mongodb';
import { io } from '../app.js';

export const userController = (db) => {
  const User = UserModel(db);
  const Recipe = RecipeModel(db);

  const getProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
            
      const { password, ...userData } = user;
      res.status(200).json({ user: userData });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };

  const updateProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, email, currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (email !== user.email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser._id.toString() !== userId) {
          return res.status(400).json({ message: 'Email is already in use' });
        }
      }
            
      const updateData = { name, email };
            
      if (newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
                
        updateData.password = await bcrypt.hash(newPassword, 10);
      }
      
      await User.updateUser(userId, updateData);
      
      const updatedUser = await User.findById(userId);
      const { password, ...userData } = updatedUser;
      
      res.status(200).json({ 
        message: 'Profile updated successfully', 
        user: userData 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Get recipes created by user
  const getUserRecipes = async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Find recipes created by the user
      const recipes = await Recipe.findByUser(userId);
      
      res.status(200).json(recipes);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  const getUserFavorites = async (req, res) => {
    try {
      const userId = req.user.id;
      
      const favoriteIds = await User.getFavorites(userId);
      
      if (!favoriteIds.length) {
        return res.status(200).json([]);
      }
            
      const objectIdFavorites = favoriteIds.map(id => 
        typeof id === 'string' ? new ObjectId(id) : id
      );
      
      const favoriteRecipes = await Recipe.findByIds(objectIdFavorites);
      
      res.status(200).json(favoriteRecipes);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };

  const updateFavorites = async (req, res) => {
    try {
      const userId = req.user.id;
      const { recipeId, action } = req.body;

      if (!['add', 'remove'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
      }

      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userName = currentUser.name || currentUser.email;

      const userUpdated = await User.updateFavorites(userId, recipeId, action);
      if (!userUpdated) {
        return res.status(404).json({ message: 'User not found or update failed' });
      }
      
      const favoritesUpdated = await Recipe.updateFavoritesByUser(recipeId, userId, action);
      if (!favoritesUpdated) {
        return res.status(404).json({ message: 'Failed to update favorites list' });
      }

      const recipeOwner = await Recipe.getRecipeOwner(recipeId);
      if (recipeOwner && action === 'add') {        
        const recipe = await Recipe.findById(recipeId);
        const recipeName = recipe ? recipe.title : 'recipe';

        const notificationMessage = `<strong>${userName}</strong> has favorited your <strong>${recipeName}</strong> recipe`;
        
        io.to(recipeOwner.toString()).emit('notification', {
          message: notificationMessage,
          recipeId
        });
      }

      res.status(200).json({ message: 'Favorites updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };

  return {
    getProfile,
    updateProfile,
    getUserRecipes,
    getUserFavorites,
    updateFavorites
  };
};