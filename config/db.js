const { MongoClient } = require('mongodb');
require('dotenv').config();

// Connection URL from environment variable
const url = process.env.STRING;
const dbName = 'eventManagementSystem';

let db;

// Create a connection pool
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB server');
    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };