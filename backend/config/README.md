# config/ — Database Configuration

This folder contains the MongoDB connection setup.

---

## 📄 `db.js`

**What it does:** Connects the Node.js application to MongoDB using Mongoose.

**How it works:**
1. Imports the `mongoose` library
2. Defines an `async` function `connectDB`
3. Calls `mongoose.connect()` with the MongoDB URI from environment variables
4. If connection succeeds → logs success message
5. If connection fails → logs error and exits the process with `process.exit(1)`

**Code breakdown:**
```javascript
const mongoose = require('mongoose');           // Import Mongoose ODM library

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(         // Connect to MongoDB
      process.env.MONGODB_URI ||                 // Read URI from .env file
      'mongodb://localhost:27017/frolic'          // Fallback to local MongoDB
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);                             // Stop server if DB fails
  }
};

module.exports = connectDB;                      // Export for use in server.js
```

**Connection options:**
- `useNewUrlParser: true` — Uses the new MongoDB connection string parser
- `useUnifiedTopology: true` — Uses the new Server Discovery and Monitoring engine

**Note:** In the current `server.js`, the connection logic is written inline rather than importing this file, but both do the same thing. This file exists as a reusable module if needed.
