const express = require('express');
const router = express.Router();

const { getGameData, updateGameHistory, getGameHistory } = require('./game.services');

/**
 * @swagger
 * /game/get-gamedata:
 *   get:
 *     summary: Retrieve game data based on region and game type
 *     tags:
 *       - Games
 *     parameters:
 *       - in: query
 *         name: regionId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the region
 *       - in: query
 *         name: gameType
 *         schema:
 *           type: string
 *           enum:
 *             - word
 *             - quiz
 *             - puzzle
 *             - treasure
 *         required: true
 *         description: The code of the game type
 *     responses:
 *       200:
 *         description: Successfully retrieved game data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       400:
 *         description: Unsupported game type
 *       404:
 *         description: Game type not found
 *       500:
 *         description: Internal server error
 */
router.get('/get-gamedata', async (req, res, next) => {
    try {
        const { regionId, gameType } = req.query;

        const data = await getGameData(regionId, gameType);

        res.json(data);
    } catch (err) {
        if (err.message === 'Game type not found' || err.message === 'Unsupported game type') {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
});

/**
 * @swagger
 * /game/update-history:
 *   post:
 *     summary: Create or update a game history record
 *     tags:
 *       - Games
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - gameTypeId
 *               - gameId
 *               - gameType
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The ID of the user
 *               gameId:
 *                 type: integer
 *                 description: The ID of the specific game
 *               gameType:
 *                 type: string
 *                 enum:
 *                   - word
 *                   - quiz
 *                   - puzzle
 *                   - treasure
 *                 description: The type of game
 *               completed:
 *                 type: boolean
 *                 description: Whether the game is completed or just started (false means updating start time, true means updating completion time)
 *                 default: false
 *     responses:
 *       200:
 *         description: Game history updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Game history updated successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - invalid parameters
 *       500:
 *         description: Internal server error
 */
router.post('/update-history', async (req, res, next) => {
    try {
        const { gameId, gameType, completed = false } = req.body;

        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Decode the token to get userId (assuming JWT and userId is in payload)
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const userId = decoded.userId;


        // Validate required parameters
        if (!userId || !gameId || !gameType) {
            return res.status(400).json({
                message: 'Missing required parameters: gameId and gameType are required'
            });
        }

        // Validate game type
        const validGameTypes = ['word', 'quiz', 'puzzle', 'treasure'];
        if (!validGameTypes.includes(gameType)) {
            return res.status(400).json({
                message: 'Invalid gameType. Must be one of: word, quiz, puzzle, treasure'
            });
        }

        const result = await updateGameHistory(userId, gameId, gameType, completed);

        res.json({
            message: 'Game history updated successfully',
            data: result
        });
    } catch (err) {
        if (err.message === 'Unsupported game type') {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
});


/**
 * @swagger
 * /game/get-history:
 *   get:
 *     summary: Retrieve game history for a user
 *     tags:
 *       - Games
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Successfully retrieved game history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 *       400:
 *         description: Missing user ID
 *       500:
 *         description: Internal server error
 */
router.get('/get-history', async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token and get userId
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const userId = decoded.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const history = await getGameHistory(userId);

        res.json(history);
    } catch (err) {
        next(err);
    }
});


module.exports = router;