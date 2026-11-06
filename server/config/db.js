const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] Could not connect to configured MONGODB_URI: ${err.message}`);
      console.log('[Database] Falling back to embedded in-memory MongoDB engine for zero-config operation...');
    }
  }

  try {
    if (!mongodInstance) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
    }
    const memoryUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Embedded in-memory MongoDB active: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[Database] Failed to start embedded MongoDB: ${memErr.message}`);
    throw memErr;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
  } catch (e) {
    console.error('[Database] Disconnect error:', e);
  }
};

module.exports = { connectDB, disconnectDB };
