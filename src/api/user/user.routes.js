const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findUserById, updateUserById } = require('./user.services');
const jwt = require('jsonwebtoken');

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
    const allowedFields = ['full_name', 'username', 'avatar_url', 'date_of_birth', 'location', 'gender'];

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

module.exports = router;
