import RecipeModel from '../models/Recipe.js';
import { ObjectId } from 'mongodb';

export const recipeController = (db) => {
  const Recipe = RecipeModel(db);

  const createRecipe = async (req, res) => {
    const { title, ingredients, steps, imageUrl } = req.body;
  
    if (!title || !ingredients || !steps) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    const recipe = {
      title,
      ingredients,
      steps,
      imageUrl: imageUrl || null,
      createdBy: req.user.id,
      createdAt: new Date()
    };
  
    const recipeId = await Recipe.createRecipe(recipe);
    res.status(201).json({ message: 'Recipe created', recipeId });
  };
  

  const getAllRecipes = async (req, res) => {
    const recipes = await Recipe.getAllRecipes();
    res.status(200).json(recipes);
  };

  const getRecipeById = async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.getRecipeById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    res.status(200).json(recipe);
  };

  const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.getRecipeById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    if (recipe.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }

    const updated = await Recipe.updateRecipe(id, updateData);
    if (updated === 0) return res.status(500).json({ message: 'Update failed' });

    res.status(200).json({ message: 'Recipe updated' });
  };

  const deleteRecipe = async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.getRecipeById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    if (recipe.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    const deleted = await Recipe.deleteRecipe(id);
    if (deleted === 0) return res.status(500).json({ message: 'Delete failed' });

    res.status(200).json({ message: 'Recipe deleted' });
  };

  return {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe
  };
};
