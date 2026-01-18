const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/frolic', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

connectDB();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const instituteRoutes = require('./routes/institutes');
const departmentRoutes = require('./routes/departments');
const eventRoutes = require('./routes/events');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/events', eventRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});