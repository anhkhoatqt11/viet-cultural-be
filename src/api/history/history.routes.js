const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { 
    createHistory, 
    updateCompletedTime, 
    findHistoryById, 
    findHistoryByUserId, 
    createAndCompleteHistory,
    findIncompleteHistory 
} = require('./history.services');
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
 *     summary: Create a new history record or update an existing incomplete one
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
 *                 description: If true, looks for an incomplete history record to update, or creates a new completed one if not found
 *               completed_time:
 *                 type: string
 *                 format: date-time
 *                 description: Optional - only used if completed is true
 *     responses:
 *       201:
 *         description: History record created successfully
 *       200:
 *         description: Existing history record updated successfully
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
        const userId = decoded.userId;        const historyData = req.body;

        // If userId is not provided in the request, use the authenticated user's ID
        if (!historyData.userId && userId) {
            historyData.userId = userId;
        }

        // Check if we need to create and complete or just create
        if (historyData.completed) {
            // First check if there's an incomplete history record for this user and game type
            const incompleteHistory = await findIncompleteHistory(historyData.userId, historyData.gameTypeId);
            
            if (incompleteHistory) {
                // Update the existing incomplete history record
                const completedHistory = await updateCompletedTime(incompleteHistory.id, {
                    completed_time: historyData.completed_time || new Date()
                });
                res.status(200).json(completedHistory);
            } else {
                // No incomplete history found, create and complete in one operation
                const completedHistory = await createAndCompleteHistory(historyData);
                res.status(201).json(completedHistory);
            }
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
 * /history/get-history:
 *   get:
 *     summary: Get all history records for a user
 *     tags: [History]
 *     responses:
 *       200:
 *         description: Returns array of history records
 *       401:
 *         description: Unauthorized
 */
router.get('/get-history', async (req, res, next) => {
    try {
        // Assuming the token is stored in a cookie named 'token'
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Decode the token to get userId (assuming JWT and userId is in payload)
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const userId = decoded.userId;

        const histories = await findHistoryByUserId(userId);

        res.json(histories);
    } catch (err) {
        next(err);
    }
});



module.exports = router;

