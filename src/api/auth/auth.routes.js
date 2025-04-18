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
const { isAuthenticated } = require('../../middlewares');
const jwt = require('jsonwebtoken');



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
 *                 example: "anhkhoatqt11@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123123123"
 *               full_name:
 *                 type: string
 *                 example: "Truong Anh Khoa"
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

    res.cookie("token", accessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "development",
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "development",
      secure: true,                       // Localhost thì false, Production thì true
      sameSite: "None",      // Localhost thì "Lax", Production thì "None"
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
 *                 example: "anhkhoatqt11@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123123123"
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
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    await addRefreshTokenToWhitelist({ refreshToken, userId: existingUser.id });

    res.json({ accessToken, refreshToken });
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
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Refresh token is required.');
    }

    const tokenRecord = await findRefreshToken(refreshToken);
    if (!tokenRecord) {
      res.status(403);
      throw new Error('Invalid refresh token.');
    }

    const user = await findUserById(tokenRecord.user_id_id);
    if (!user) {
      res.status(403);
      throw new Error('User not found.');
    }

    // Invalidate the old refresh token
    await deleteRefreshTokenById(tokenRecord.id);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    await addRefreshTokenToWhitelist({ refreshToken: newRefreshToken, userId: user.id });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
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
 *               - email
 *             properties:
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
 *         description: Email is required, user not found, or an error occurred.
 */

router.post('/send-verification-email', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Email is required.');
    }

    // Find the user by email
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }

    // Generate a 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // otp expires in 24 hours

    // Delete any existing OTP for the user before creating a new one
    await db.email_verifications.deleteMany({
      where: { user_id_id: user.id },
    });

    // Save the OTP in the EmailVerification model with updated fields
    await db.email_verifications.create({
      data: {
        user_id_id: user.id,
        otp,
        expires_at: expiresAt,
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
    const record = await db.email_verifications.findFirst({
      where: { otp },
    });

    if (!record || record.expires_at < new Date()) {
      res.status(400);
      throw new Error('Invalid or expired OTP.');
    }

    // Mark the user as verified. Assumes the users model has an 'isVerified' field.
    await db.user.update({
      where: { id: record.user_id_id },
      data: { is_verified: true },
    });

    // Delete the verification record after successful verification
    await db.email_verifications.delete({
      where: { id: record.id },
    });

    res.json({ status: 200, message: 'Email successfully verified' });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and clear tokens
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const tokenRecord = await findRefreshToken(refreshToken);
      if (tokenRecord) {
        await deleteRefreshTokenById(tokenRecord.id);
      }
    }
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'None' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'None' });
    res.json({ status: 200, message: 'Successfully logged out' });
  } catch (err) {
    next(err);
  }
});


/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset by sending OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset OTP sent successfully
 *       400:
 *         description: Email is required
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Email is required.');
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }

    // Generate a 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // OTP expires in 1 hour

    // Delete any existing reset OTPs for the user
    await db.password_resets.deleteMany({
      where: { user_id_id: user.id },
    });

    // Save the OTP in the password_resets table
    await db.password_resets.create({
      data: {
        user_id_id: user.id,
        otp,
        expires_at: expiresAt,
      },
    });

    // Send the password reset email containing the OTP
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Password Reset - Your OTP Code',
      text: `Your password reset OTP code is: ${otp}. This code will expire in 1 hour.`,
      html: `<p>Your password reset OTP code is: <strong>${otp}</strong>.</p><p>This code will expire in 1 hour.</p>`,
    });

    res.json({ status: 200, message: 'Password reset OTP sent to your email' });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using OTP and new password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - newPassword
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or missing parameters
 *       404:
 *         description: Invalid or expired OTP
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword) {
      res.status(400);
      throw new Error('OTP and new password are required.');
    }

    // Find the password reset record by OTP
    const resetRecord = await db.password_resets.findFirst({
      where: { otp },
    });

    if (!resetRecord || resetRecord.expires_at < new Date()) {
      res.status(404);
      throw new Error('Invalid or expired OTP.');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await db.user.update({
      where: { id: resetRecord.user_id_id },
      data: { password: hashedPassword },
    });

    // Delete the reset record after successful password change
    await db.password_resets.delete({
      where: { id: resetRecord.id },
    });

    // Revoke all refresh tokens for this user as a security measure
    await revokeTokens(resetRecord.user_id_id);

    res.json({ status: 200, message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
});



module.exports = router;

