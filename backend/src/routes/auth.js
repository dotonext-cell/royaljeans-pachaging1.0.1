const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, fullName, nickname, role = 'USER' } = req.body;

    // Use fullName if displayName not provided (for compatibility)
    const finalDisplayName = displayName || fullName;

    // Validation
    if (!email || !password || !finalDisplayName) {
      return res.status(400).json({ message: 'همه فیلدهای اجباری را پر کنید' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'رمز عبور باید حداقل 6 کاراکتر باشد' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'این ایمیل قبلاً ثبت شده است' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName: finalDisplayName,
        nickname: nickname || finalDisplayName, // Default nickname to displayName if not provided
        role
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        nickname: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'کاربر با موفقیت ایجاد شد',
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'خطا در ایجاد کاربر' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'ایمیل و رمز عبور اجباری است' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'ایمیل یا رمز عبور اشتباه است' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'ایمیل یا رمز عبور اشتباه است' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'ورود موفقیت‌آمیز',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'خطا در ورود' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        nickname: true,
        avatar: true,
        phone: true,
        bio: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'خطا در دریافت اطلاعات کاربر' });
  }
});

module.exports = router;