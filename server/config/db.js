import { MongoClient } from 'mongodb';

const URL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@gofood.ct37prx.mongodb.net/?retryWrites=true&w=majority&appName=GoFood`;

const client = new MongoClient(URL);
const dbName = 'GoFood';

export const connectDB = async () => {
  try {
    await client.connect();
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
};

export const db = client.db(dbName);
