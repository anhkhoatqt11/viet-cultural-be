const express = require('express');
const router = express.Router();
const { getAllTags, getTagById, getPostsByTagId } = require('./tags.services');

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags
 *     tags:
 *       - Tags
 *     description: Retrieve a list of all available tags
 *     responses:
 *       200:
 *         description: A list of tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const tags = await getAllTags();
        res.status(200).json(tags);
    } catch (error) {
        console.error('Error in GET /tags:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Get a tag by ID
 *     tags:
 *       - Tags
 *     description: Retrieve a single tag by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: A single tag object
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
        const tagId = req.params.id;
        const tag = await getTagById(tagId);
        
        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        
        res.status(200).json(tag);
    } catch (error) {
        console.error(`Error in GET /tags/${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /tags/{id}/posts:
 *   get:
 *     summary: Get posts by tag ID
 *     tags:
 *       - Tags
 *     description: Retrieve all posts associated with a specific tag
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: List of posts with this tag
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   question:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       full_name:
 *                         type: string
 *       404:
 *         description: Tag not found or no posts with this tag
 *       500:
 *         description: Server error
 */
router.get('/:id/posts', async (req, res) => {
    try {
        const tagId = req.params.id;
        
        // First verify if tag exists
        const tag = await getTagById(tagId);
        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        
        const posts = await getPostsByTagId(tagId);
        res.status(200).json(posts);
    } catch (error) {
        console.error(`Error in GET /tags/${req.params.id}/posts:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;