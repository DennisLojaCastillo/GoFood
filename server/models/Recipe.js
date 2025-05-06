import { ObjectId } from 'mongodb';

export default function RecipeModel(db) {
  const collection = db.collection('recipes');

  const createRecipe = async (recipeData) => {
    const recipe = { ...recipeData, favoritesCount: 0, favoritedBy: [] };
    const result = await collection.insertOne(recipe);
    return result.insertedId;
  };

  const getAllRecipes = async () => {
    return await collection.find({}).toArray();
  };

  const getRecipeById = async (id) => {
    return await collection.findOne({ _id: new ObjectId(id) });
  };
  
  const findById = async (id) => {
    return await getRecipeById(id);
  };

  const findByIds = async (recipeIds) => {
    if (!recipeIds || !recipeIds.length) return [];
    
    return await collection.find({
      _id: { $in: recipeIds }
    }).toArray();
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

  const updateFavoritesCount = async (id, action) => {
    const update = action === 'add' ? { $inc: { favoritesCount: 1 } } : { $inc: { favoritesCount: -1 } };
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      update
    );
    return result.modifiedCount > 0;
  };

  const updateFavoritesByUser = async (recipeId, userId, action) => {
    const update = action === 'add' ? { $addToSet: { favoritedBy: userId }, $inc: { favoritesCount: 1 } } : { $pull: { favoritedBy: userId }, $inc: { favoritesCount: -1 } };
    const result = await collection.updateOne(
      { _id: new ObjectId(recipeId) },
      update
    );
    return result.modifiedCount > 0;
  };

  const findByUser = async (userId) => {
    return await collection.find({ 
      createdBy: userId 
    }).toArray();
  };
  
  const getRecipes = async (page = 1, limit = 10, filter = {}) => {
    const skip = (page - 1) * limit;
    const recipes = await collection.find(filter)
      .sort({ createdAt: -1 })
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

  const getRecipeOwner = async (recipeId) => {
    const recipe = await collection.findOne({ _id: new ObjectId(recipeId) }, { projection: { createdBy: 1 } });
    return recipe ? recipe.createdBy : null;
  };

  return {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    findById,
    findByIds,
    updateRecipe,
    deleteRecipe,
    findByUser,
    getRecipes,
    updateFavoritesCount,
    getRecipeOwner,
    updateFavoritesByUser
  };
}
