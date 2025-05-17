const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { createHistory, updateCompletedTime, findHistoryById, findHistoryByUserId, createAndCompleteHistory } = require('./history.services');
const jwt = require('jsonwebtoken');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: History
 *   description: Game history management endpoints
 */

/**
 * @swagger
 * /history:
 *   post:
 *     summary: Create a new history record and optionally set completed_time
 *     tags: [History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameTypeId:
 *                 type: integer
 *               regionId:
 *                 type: integer
 *               description:
 *                 type: string
 *               started_time:
 *                 type: string
 *                 format: date-time
 *               completed:
 *                 type: boolean
 *                 description: If true, sets the completed_time to now or to the provided completed_time
 *               completed_time:
 *                 type: string
 *                 format: date-time
 *                 description: Optional - only used if completed is true
 *     responses:
 *       201:
 *         description: History record created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', async (req, res, next) => {
    try {
        // Assuming the token is stored in a cookie named 'token'
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Decode the token to get userId (assuming JWT and userId is in payload)
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const userId = decoded.userId;

        const historyData = req.body;

        // If userId is not provided in the request, use the authenticated user's ID
        if (!historyData.userId && userId) {
            historyData.userId = userId;
        }

        // Check if we need to create and complete or just create
        if (historyData.completed) {
            // Create and complete in one operation
            const completedHistory = await createAndCompleteHistory(historyData);
            res.status(201).json(completedHistory);
        } else {
            // Just create the history
            const newHistory = await createHistory(historyData);
            res.status(201).json(newHistory);
        }
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /history/{id}:
 *   get:
 *     summary: Get a history record by ID
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns history record
 *       404:
 *         description: History record not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const history = await findHistoryById(id);

        if (!history) {
            return res.status(404).json({ message: 'History record not found' });
        }

        res.json(history);
    } catch (err) {
        next(err);
    }
});

module.exports = router;

