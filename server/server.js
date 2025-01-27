import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// 基本的 CORS 中間件
app.use(cors({
  origin: true, // 允許所有來源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 基本路由 - 用於調試
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json({
    message: 'API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/debug', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    mongoUri: process.env.MONGO_URI ? 'Set' : 'Not set',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
    emailPass: process.env.EMAIL_PASS ? 'Set' : 'Not set',
    clientUrl: process.env.CLIENT_URL ? 'Set' : 'Not set',
    headers: req.headers,
    timestamp: new Date().toISOString(),
  });
});

// 資料庫連接
try {
  await connectDB();
  console.log('MongoDB connected successfully');
} catch (error) {
  console.error('MongoDB connection error:', error);
}

// Routes
app.use('/api/users', userRoutes);

// 404 處理
app.use('*', (req, res) => {
  console.log('404 Route not found:', req.originalUrl);
  res.status(404).json({
    status: 404,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : '🥞',
    timestamp: new Date().toISOString(),
  });
});

// 在所有環境下啟動服務器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;