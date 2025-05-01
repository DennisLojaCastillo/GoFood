import { ObjectId } from 'mongodb';

export default function RecipeModel(db) {
  const collection = db.collection('recipes');

  const createRecipe = async (recipeData) => {
    const result = await collection.insertOne(recipeData);
    return result.insertedId;
  };

  const getAllRecipes = async () => {
    return await collection.find({}).toArray();
  };

  const getRecipeById = async (id) => {
    return await collection.findOne({ _id: new ObjectId(id) });
  };

  const updateRecipe = async (id, updateData) => {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return result.modifiedCount;
  };

  const deleteRecipe = async (id) => {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount;
  };

  // Find recipes created by a specific user
  const findByUser = async (userId) => {
    return await collection.find({ 
      createdBy: userId 
    }).toArray();
  };
  
  // Get recipes with pagination
  const getRecipes = async (page = 1, limit = 10, filter = {}) => {
    const skip = (page - 1) * limit;
    const recipes = await collection.find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await collection.countDocuments(filter);
    
    return {
      recipes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  };

  return {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    findByUser,
    getRecipes
  };
}
