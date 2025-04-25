const express = require('express')
const { getAllAchievements, getAchievementById, createAchievement, updateAchievement, deleteAchievement } = require('./achievement.services')
const router = express.Router()
const jwt = require('jsonwebtoken')
/**
 * @swagger
 * /achievements/get-achievement:
 *   get:
 *     tags: [Achievements]
 *     summary: Get all achievements
 *     description: Retrieve a list of all achievements.
 *     responses:
 *       200:
 *         description: Successfully retrieved all achievements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /achievements/get-achievement/{regionId}:
 *   get:
 *     tags: [Achievements]
 *     summary: Get an achievement by userId and regionId
 *     description: Retrieve a specific achievement by user ID and region ID.
 *     parameters:
 *       - in: path
 *         name: regionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the region
 *     responses:
 *       200:
 *         description: Successfully retrieved the achievement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Achievement not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /achievements/create-achievement:
 *   post:
 *     tags: [Achievements]
 *     summary: Create a new achievement
 *     description: Create a new achievement for a user and region.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The ID of the user
 *                 example: 1
 *               regionId:
 *                 type: integer
 *                 description: The ID of the region
 *                 example: 2
 *               name:
 *                 type: string
 *                 description: The name of the achievement
 *                 example: "Achievement Name"
 *               description:
 *                 type: string
 *                 description: A description of the achievement
 *                 example: "This is an achievement description."
 *     responses:
 *       201:
 *         description: Achievement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /achievements/update-achievement/{regionId}:
 *   patch:
 *     tags: [Achievements]
 *     summary: Update an achievement by ID
 *     description: Update an existing achievement by its ID.
 *     parameters:
 *       - in: path
 *         name: regionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The region id of the achievement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               history:
 *                 type: boolean
 *                 description: Whether the history stage is completed
 *                 example: true
 *               intangible_heritage:
 *                 type: boolean
 *                 description: Whether the intangible heritage stage is completed
 *                 example: false
 *               tangible_heritage:
 *                 type: boolean
 *                 description: Whether the tangible heritage stage is completed
 *                 example: true
 *     responses:
 *       200:
 *         description: Achievement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Achievement not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /achievements/delete-achievement/{regionId}:
 *   delete:
 *     tags: [Achievements]
 *     summary: Delete an achievement by ID
 *     description: Delete an achievement by its ID.
 *     parameters:
 *       - in: path
 *         name: regionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the region
 *     responses:
 *       204:
 *         description: Achievement deleted successfully
 *       404:
 *         description: Achievement not found
 *       500:
 *         description: Internal server error
 */

router.get('/get-achievement', async (req, res, next) => {
    try {
        const posts = await getAllAchievements()
        res.json(posts)
    } catch (error) {
        next(error)
    }
})

router.get('/get-achievement/:regionId', async (req, res, next) => {
    try {
            const token = req.cookies?.token;
            if (!token) {
              return res.status(401).json({ message: 'No token provided' });
            }
        
            // Decode the token to get userId (assuming JWT and userId is in payload)
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const userId = decoded.userId;

        const post = await getAchievementById(parseInt(userId), parseInt(req.params.regionId))
        res.json(post)
    } catch (error) {
        next(error)
    }
})

router.post('/create-achievement', async (req, res, next) => {
    try {
        res.status(201).json({
            message: "Đã tạo achievement",
            metadata: await createAchievement(req.body)
        })
    } catch (error) {
        next(error)
    }
})

router.patch('/update-achievement/:regionId', async (req, res, next) => {
    try {
            const token = req.cookies?.token;
            if (!token) {
              return res.status(401).json({ message: 'No token provided' });
            }
        
            // Decode the token to get userId (assuming JWT and userId is in payload)
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const userId = decoded.userId;

        res.status(200).json({
            message: "Đã cập nhật achievement",
            metadata: await updateAchievement(parseInt(userId), parseInt(req.params.regionId), req.body)
        })
    } catch (error) {
        next(error)
    }
})

router.delete('/delete-achievement/:regionId', async (req, res, next) => {
    try {
            const token = req.cookies?.token;
            if (!token) {
              return res.status(401).json({ message: 'No token provided' });
            }
        
            // Decode the token to get userId (assuming JWT and userId is in payload)
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const userId = decoded.userId;
        res.status(204).send({
            message: "Đã xóa achievement",
            metadata: await deleteAchievement( parseInt(userId), parseInt(req.params.regionId))
        });
    } catch (error) {
        next(error)
    }
})

module.exports = router