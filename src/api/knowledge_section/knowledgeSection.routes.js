const express = require('express')
const { getAllSections } = require('./knowledgeSection.services')
const router = express.Router()


/**
 * @swagger
 * /section/:
 *   get:
 *     tags: [KnowledgeSection]
 *     summary: Get all knowledge section
 *     description: Retrieve all knowledge section.
 *     responses:
 *       200:
 *         description: Successfully retrieved the knowledge section
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 items:
 *                   type: array
 *       404:
 *         description: Knowledge section not found
 *       500:
 *         description: Internal server error
 */

router.get('/', async (req, res, next) => {
    try {
        const sections = await getAllSections()
        res.json(sections)
    } catch (error) {
        next(error)
    }
})

module.exports = router