const express = require('express')
const { createFeedback, getAllFeedback } = require('./feedback.services')
const router = express.Router()
const jwt = require('jsonwebtoken')
/**
 * @swagger
 * /feedback/:
 *   post:
 *     tags: [Feedback]
 *     summary: Create a new feedback
 *     description: Create a feedback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: 
 *                 type: string
 *                 description: The title of feedback
 *               content:
 *                 type: string
 *                 description: The content of the feedback
 *     responses:
 *       201:
 *         description: Successfully created a new feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
    
        // Decode the token to get userId (assuming JWT and userId is in payload)
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const userId = decoded.userId;
        const feedback = await createFeedback( parseInt(userId) ,req.body)
        res.status(201).json(feedback)
    } catch (error) {
        next(error)
    }
})

/**
 * @swagger
 * /feedback/:
 *   get:
 *     tags: [Feedback]
 *     summary: Get all feedbacks
 *     description: Retrieve a list of all feedbacks.
 *     responses:
 *       200:
 *         description: Successfully retrieved all feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 */

router.get('/', async(req, res, next) => {
    try {
        const feedbacks = await getAllFeedback()
        res.json(feedbacks)
    } catch (error) {
        next(error)
    }
} )

module.exports = router