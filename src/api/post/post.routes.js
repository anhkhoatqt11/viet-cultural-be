const express = require('express');
const router = express.Router();


const { createPost, getPostById, getAllPosts, commentPost, likePost, isPostLikedByUser, getLikesByPostId } = require('./post.services');

/**
 * @swagger
 * components:
 *   schemas:
 *     ImageData:
 *       type: object
 *       properties:
 *         fileKey:
 *           type: string
 *           description: The key of the uploaded file from UploadThing
 *         fileUrl:
 *           type: string
 *           description: The URL of the uploaded image
 *         fileName:
 *           type: string
 *           description: The name of the uploaded file
 *         fileSize:
 *           type: number
 *           description: The size of the file in bytes
 *         fileType:
 *           type: string
 *           description: The MIME type of the file
 */

/**
 * @swagger
 * tags:
 *   - name: Upload
 *     description: File upload operations
 *   - name: Posts
 *     description: Post management operations
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image using UploadThing
 *     tags:
 *       - Upload
 *     description: Uploads image files to UploadThing for use in posts
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileKey:
 *                   type: string
 *                 fileUrl:
 *                   type: string
 *                 fileName:
 *                   type: string
 *                 fileSize:
 *                   type: number
 *       500:
 *         description: Failed to upload file
 */

/**
 * @swagger
 * /post/create-post:
 *   post:
 *     summary: Create a new post with optional image
 *     tags:
 *       - Posts
 *     description: Creates a new post with text content and optionally an image uploaded via UploadThing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *                 description: ID of the user creating the post
 *               title:
 *                 type: string
 *                 description: Title of the post
 *               question:
 *                 type: string
 *                 description: Main content or question of the post
 *               image_id:
 *                 type: number
 *                 description: ID of the pre-uploaded image (obtained from upload/save-media endpoint)
 *               image:
 *                 $ref: '#/components/schemas/ImageData'
 *                 description: Direct image data from UploadThing (alternative to image_id)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array of tag IDs to associate with the post
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *                 question:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                   description: Full URL to the image
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     full_name:
 *                       type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request - missing required fields
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
 *     summary: Get all posts with pagination and search
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering posts by title or content
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, title]
 *           default: created_at
 *         description: Field to sort posts by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: Posts retrieved successfully with pagination data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
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
        const { page, limit, search, sortBy, sortOrder } = req.query;
        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            search: search || '',
            sortBy: sortBy || 'created_at',
            sortOrder: sortOrder || 'desc'
        };

        const result = await getAllPosts(options);
        res.json(result);
    } catch (err) {
        console.error('Error fetching posts:', err);
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


/**
 * @swagger
 * /post/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags:
 *       - Posts
 *     description: Toggle like status for a post. Creates a relation if not liked, removes if already liked.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: number
 *                 description: ID of the post to like/unlike
 *               userId:
 *                 type: number
 *                 description: ID of the user liking/unliking the post
 *     responses:
 *       200:
 *         description: Success response with updated like status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   description: Current like status (true=liked, false=not liked)
 *                 likeCount:
 *                   type: number
 *                   description: Updated number of likes for the post
 *                 message:
 *                   type: string
 *                   description: Success message
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.post('/like', async (req, res) => {
    try {
        const { postId, userId } = req.body;

        if (!postId || !userId) {
            return res.status(400).json({ error: 'Missing required fields: postId or userId' });
        }

        const result = await likePost(postId, userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error liking post:', error);

        if (error.message === 'Post not found') {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /post/{postId}/is-liked:
 *   get:
 *     summary: Check if a user liked a post
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the post to check
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the user to check
 *     responses:
 *       200:
 *         description: Successfully retrieved like status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 */
router.get('/:postId/is-liked', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'Missing required query parameter: userId' });
        }

        const liked = await isPostLikedByUser(postId, userId);
        res.status(200).json({ liked });
    } catch (error) {
        console.error('Error checking post like status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /post/{postId}/likes:
 *   get:
 *     summary: Get users who liked a post
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Successfully retrieved users who liked the post
 *       500:
 *         description: Internal server error
 */
router.get('/:postId/likes', async (req, res) => {
    try {
        const { postId } = req.params;
        const likes = await getLikesByPostId(postId);
        res.status(200).json(likes);
    } catch (error) {
        console.error('Error fetching post likes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;