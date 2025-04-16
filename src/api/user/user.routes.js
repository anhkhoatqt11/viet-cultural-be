const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findUserById } = require('./user.services');
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

module.exports = router;
