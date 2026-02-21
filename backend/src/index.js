require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const contractorRoutes = require('./routes/contractors');
const reportsRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const avatarRoutes = require('./routes/avatars');
const dashboardRoutes = require('./routes/dashboard');
const productsRoutes = require('./routes/products');
const workflowRoutes = require('./routes/workflow');
const inventoryRoutes = require('./routes/inventory');
const financeRoutes = require('./routes/finance');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'http://localhost:5173'] 
    : ['http://localhost:3000', 'http://localhost:5173']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', avatarRoutes); // Avatar upload under users route
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/finance', financeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'خطای سرور!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'خطای داخلی سرور'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'آدرس یافت نشد' });
});

app.listen(PORT, () => {
  console.log(`🚀 سرور رویال جینز در پورت ${PORT} در حال اجرا است`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});