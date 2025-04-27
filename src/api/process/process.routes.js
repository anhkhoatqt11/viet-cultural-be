const express = require('express')
const { createProcess, getProcessById, updateProcess, deleteProcessById } = require('./process.services')

const router = express.Router()

/**
 * @swagger
 * /process/create-process:
 *   post:
 *     tags: [Process]
 *     summary: Create a new process
 *     description: Create a new play process for a user and achievement.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user
 *                 example: 1
 *               achievementId:
 *                 type: integer
 *                 description: ID of the achievement
 *                 example: 2
 *     responses:
 *       201:
 *         description: Process created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /process/{id}:
 *   get:
 *     tags: [Process]
 *     summary: Get process by ID
 *     description: Retrieve a play process by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the process
 *     responses:
 *       200:
 *         description: Process retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Process not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /process/{id}:
 *   patch:
 *     tags: [Process]
 *     summary: Update process by ID
 *     description: Update a play process by its ID. Stars will be incremented based on the provided fields.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the process
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
 *         description: Process updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /process/{id}:
 *   delete:
 *     tags: [Process]
 *     summary: Delete process by ID
 *     description: Delete a play process by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the process
 *     responses:
 *       204:
 *         description: Process deleted successfully
 *       500:
 *         description: Internal server error
 */

router.post('/create-process', async(req, res, next) => {
    try {
        const {userId, achievementId} = req.body
        const newProcess = await createProcess(userId, achievementId)
        res.status(201).json(newProcess)
    } catch (error) {
        next(error)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const process = await getProcessById(parseInt(req.params.id));
        if (!process) {
            return res.status(404).json({ error: 'Process not found' });
        }
        res.status(200).json(process);
    } catch (error) {
        next(error)
    }
})

router.patch('/:id', async (req, res, next) => {
    try {
        res.status(200).json({
            message: "Đã cập nhật process",
            metadata: await updateProcess(parseInt(req.params.id), req.body)
        })
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        res.status(204).send({
            message: "Đã xóa process",
            metadata: await deleteProcessById(parseInt(req.params.id))
        });
    } catch (error) {
        next(error)
    }
})

module.exports = router