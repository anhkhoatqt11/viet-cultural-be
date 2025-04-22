const express = require('express');
const router = express.Router();


const { createPost, getPostById, getAllPosts, commentPost } = require('./post.services');

/**
 * @swagger
 * /post/create-post:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id_id:
 *                 type: number
 *               title:
 *                 type: string
 *               question:
 *                 type: string
 *               media:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /post/get-post:
 *   get:
 *     summary: Get a post by ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /post/get-all-posts:
 *   get:
 *     summary: Get all posts
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       500:
 *         description: Internal server error
 */

router.post('/create-post', async (req, res) => {
    try {
        const postData = req.body;
        const newPost = await createPost({
            ...postData,
        });
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/get-post', async (req, res, next) => {
    try {
        const { postId } = req.query;
        // Assuming you have a function to get a post by ID
        const post = await getPostById(postId);
        res.json(post);
    } catch (err) {
        next(err);
    }
});

router.get('/get-all-posts', async (req, res, next) => {
    try {
        // Assuming you have a function to get posts by user ID
        const posts = await getAllPosts();
        res.json(posts);
    } catch (err) {
        next(err);
    }
});


/**
 * @swagger
 * /post/comment-post:
 *   post:
 *     summary: Add a comment to a post
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       500:
 *         description: Internal server error
 */

router.post('/comment-post', async (req, res, next) => {
    try {
        const { postId, comment } = req.body;
        // Assuming you have a function to comment on a post
        const post = await commentPost(postId, comment);
        res.json(post);
    } catch (err) {
        next(err);
    }
});



module.exports = router;