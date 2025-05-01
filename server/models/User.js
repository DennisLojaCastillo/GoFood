import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

export default function UserModel(db) {
  const collection = db.collection('users');

  const createUser = async ({ name, email, password, role = 'user' }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { name, email, password: hashedPassword, role };
    const result = await collection.insertOne(user);
    return result.insertedId;
  };

  const findByEmail = async (email) => {
    return await collection.findOne({ email });
  };

  const findById = async (id) => {
    return await collection.findOne({ _id: new ObjectId(id) });
  };

  const updateUser = async (id, userData) => {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: userData }
    );
    return result.modifiedCount > 0;
  };

  return {
    createUser,
    findByEmail,
    findById,
    updateUser
  };
}
