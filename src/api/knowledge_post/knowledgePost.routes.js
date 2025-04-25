const express = require('express')
const { getPostById, getPostsByType, getPostsBySubject } = require('./knowledgePost.services')
const router = express.Router()

/**
 * @swagger
 * /knowledge-post/get-post/{id}:
 *   get:
 *     tags: [KnowledgePost]
 *     summary: Get a knowledge post by ID
 *     description: Retrieve a knowledge post by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the knowledge post
 *     responses:
 *       200:
 *         description: Successfully retrieved the knowledge post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *       404:
 *         description: Knowledge post not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /knowledge-post/get-post:
 *   get:
 *     tags: [KnowledgePost]
 *     summary: Get knowledge posts by subject or type with pagination
 *     description: Retrieve knowledge posts filtered by their subject or type using query string, with pagination support.
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: The subject of the knowledge posts
 *         example: "Đồng bằng Bắc Bộ"
 *       - in: query
 *         name: postType
 *         schema:
 *           type: string
 *         description: The type of the knowledge posts (e.g., article, video, etc.)
 *         example: "article"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved the knowledge posts with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                 total:
 *                   type: integer
 *                   description: Total number of posts
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   description: Number of items per page
 *       400:
 *         description: Either subject or postType is required
 *       404:
 *         description: No knowledge posts found for the given criteria
 *       500:
 *         description: Internal server error
 */
router.get('/get-post/:id', async (req, res, next) => {
    try {
        const post = await getPostById(parseInt(req.params.id))
        res.json(post)
    } catch (error) {
        next(error)
    }
})

router.get('/get-post', async (req, res, next) => {
    try {
        const { subject, postType, page = 1, limit = 10 } = req.query;

        if (!subject && !postType) {
            return res.status(400).json({ error: 'Either subject or postType is required' });
        }

        let posts;
        if (subject) {
            posts = await getPostsBySubject({ subject, page: parseInt(page), limit: parseInt(limit) });
        } else if (postType) {
            posts = await getPostsByType({ postType, page: parseInt(page), limit: parseInt(limit) });
        }

        if (!posts || posts.length === 0) {
            return res.status(404).json({ error: 'No knowledge posts found' });
        }

        res.json(posts);
    } catch (error) {
        next(error);
    }
})


module.exports = router