const express = require('express');
const bcrypt = require('bcrypt');
const { generateTokens } = require('../../utils/jwt');
const {
  addRefreshTokenToWhitelist,
  findRefreshToken,
  deleteRefreshTokenById,
  revokeTokens,
} = require('./auth.services');

const router = express.Router();
const {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
} = require('../user/user.services');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               full_name:
 *                 type: string
 *                 example: "John Doe"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "2003-11-21T01:11:11Z"
 *               location:
 *                 type: string
 *                 example: "New York"
 *               gender:
 *                 type: string
 *                 example: "Male"
 *     responses:
 *       200:
 *         description: Successfully registered
 *       400:
 *         description: Email already in use or missing fields
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, full_name, username, date_of_birth, location, gender } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400);
      throw new Error('Email already in use.');
    }

    const user = await createUserByEmailAndPassword({
      email, password, full_name, username, date_of_birth, location, gender
    });

    const { accessToken, refreshToken } = generateTokens(user);
    await addRefreshTokenToWhitelist({ refreshToken, userId: user.id });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successful login, returns access and refresh tokens
 *       403:
 *         description: Invalid login credentials
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const { accessToken, refreshToken } = generateTokens(existingUser);
    await addRefreshTokenToWhitelist({ refreshToken, userId: existingUser.id });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
