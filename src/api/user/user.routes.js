const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findUserById, updateUserById } = require('./user.services');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile (excluding password)
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', async (req, res, next) => {
  try {
    // Assuming the token is stored in a cookie named 'token'
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode the token to get userId (assuming JWT and userId is in payload)
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.userId;

    const user = await findUserById(userId);
    delete user.password;
    res.json(user);
  } catch (err) {
    next(err);
  }
});


/**
 * @swagger
 * /users/update-profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               username:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               gender:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.put('/update-profile', async (req, res, next) => {
  try {
    // Assuming the token is stored in a cookie named 'token'
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode the token to get userId (assuming JWT and userId is in payload)
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.userId;
    const updateData = {};

    // Only include fields that are provided in the request
    const allowedFields = ['full_name', 'username', 'avatar_url', 'date_of_birth', 'location', 'gender', 'age_range', 'nationality'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Add updated_at timestamp
    updateData.updated_at = new Date();

    // Update the user in the database - assuming this method exists
    const updatedUser = await updateUserById(userId, updateData);

    // Return the updated user without sensitive information
    delete updatedUser.password;
    delete updatedUser.hash;
    delete updatedUser.salt;
    delete updatedUser.reset_password_token;
    delete updatedUser.reset_password_expiration;

    res.json(updatedUser);
  } catch (err) {
    if (err.code === 'P2002') {
      // Unique constraint violation in Prisma
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    next(err);
  }
});

/**
 * @swagger
 * /users/update-password:
 *   put:
 *     summary: Update user password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 required: true
 *               newPassword:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Unauthorized or incorrect old password
 *       400:
 *         description: Bad request
 */
router.put('/update-password', async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.userId;

    // Get old and new passwords from request body
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    // Get user to verify old password
    const user = await findUserById(userId);
    
    // Import bcrypt or your authentication method here
    
    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    await updateUserById(userId, {
      password: hashedPassword,
      updated_at: new Date()
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});



module.exports = router;
