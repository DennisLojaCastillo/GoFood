import bcrypt from 'bcrypt';
import UserModel from '../models/User.js';
import RecipeModel from '../models/Recipe.js';
import { ObjectId } from 'mongodb';

export const userController = (db) => {
  const User = UserModel(db);
  const Recipe = RecipeModel(db);

  // Get user profile
  const getProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user data without password
      const { password, ...userData } = user;
      res.status(200).json({ user: userData });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Update user profile
  const updateProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, email, currentPassword, newPassword } = req.body;
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if email is already taken by another user
      if (email !== user.email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser._id.toString() !== userId) {
          return res.status(400).json({ message: 'Email is already in use' });
        }
      }
      
      // Prepare update data
      const updateData = { name, email };
      
      // Handle password change if requested
      if (newPassword) {
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Hash new password
        updateData.password = await bcrypt.hash(newPassword, 10);
      }
      
      // Update user
      await User.updateUser(userId, updateData);
      
      // Get updated user data
      const updatedUser = await User.findById(userId);
      const { password, ...userData } = updatedUser;
      
      res.status(200).json({ 
        message: 'Profile updated successfully', 
        user: userData 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
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
      console.error('Error getting user recipes:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  return {
    getProfile,
    updateProfile,
    getUserRecipes
  };
}; 