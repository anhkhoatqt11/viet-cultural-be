const express = require('express');
const bcrypt = require('bcrypt');
const { generateTokens } = require('../../utils/jwt');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
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
const { db } = require('../../utils/db');


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
 *     responses:
 *       200:
 *         description: Successfully registered
 *       400:
 *         description: Email already in use or missing fields
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;
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
      email, password, full_name
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


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user by revoking their tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "some-valid-refresh-token"
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: Refresh token is required
 *       403:
 *         description: Invalid refresh token
 */
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Refresh token is required.');
    }
    await revokeTokens(refreshToken);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});



/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "some-valid-refresh-token"
 *     responses:
 *       200:
 *         description: Successfully refreshed tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "new-access-token"
 *                 refreshToken:
 *                   type: string
 *                   example: "new-refresh-token"
 *       400:
 *         description: Refresh token is required
 *       403:
 *         description: Invalid refresh token or User not found
 */
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Refresh token is required.');
    }

    const tokenRecord = await findRefreshToken(refreshToken);
    if (!tokenRecord) {
      res.status(403);
      throw new Error('Invalid refresh token.');
    }

    const user = await findUserById(tokenRecord.userId);
    if (!user) {
      res.status(403);
      throw new Error('User not found.');
    }

    // Invalidate the old refresh token
    await deleteRefreshTokenById(tokenRecord.id);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    await addRefreshTokenToWhitelist({ refreshToken: newRefreshToken, userId: user.id });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // using STARTTLS
  requireTLS: true,
  auth: {
    user: "anhkhoatqt11@gmail.com",
    pass: "zirdmvffawibixcl",
  },
});

/**
 * @swagger
 * /auth/send-verification-email:
 *   post:
 *     summary: Send email verification OTP.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - email
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 9
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *     responses:
 *       200:
 *         description: Verification email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification email sent"
 *       400:
 *         description: User ID and email are required, or an error occurred.
 */

router.post('/send-verification-email', async (req, res, next) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      res.status(400);
      throw new Error('User ID and email are required.');
    }

    // Generate a 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // otp expires in 24 hours

    // Save the OTP in the EmailVerification model with updated fields
    await db.emailVerification.create({
      data: {
        userId,
        otp,
        expiresAt,
      },
    });

    // Send the verification email containing the OTP
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Your OTP Code',
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    });

    res.json({ status: 200, message: 'Verification email sent' });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verify user's email address using an OTP code.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: otp
 *         description: OTP code received in the email.
 *         required: true
 *         schema:
 *           type: string
 *           example: "123456"
 *     responses:
 *       200:
 *         description: Email successfully verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email successfully verified"
 *       400:
 *         description: OTP is missing, invalid, or expired.
 */
router.get('/verify-email', async (req, res, next) => {
  try {
    const { otp } = req.query;
    if (!otp) {
      res.status(400);
      throw new Error('OTP is required.');
    }

    // Find the email verification record by otp
    const record = await db.emailVerification.findFirst({
      where: { otp },
    });

    if (!record || record.expiresAt < new Date()) {
      res.status(400);
      throw new Error('Invalid or expired OTP.');
    }

    // Mark the user as verified. Assumes the users model has an 'isVerified' field.
    await db.users.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    // Delete the verification record after successful verification
    await db.emailVerification.delete({
      where: { id: record.id },
    });

    res.json({ status: 200, message: 'Email successfully verified' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

