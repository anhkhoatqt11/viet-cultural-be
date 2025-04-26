const express = require('express');
const { db } = require('../../utils/db');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints for image management (GET only)
 */

// Remove the old POST / route as uploads are now handled by /api/uploadthing
/*
 * @swagger
 * /upload:
 *   post:
 *     summary: DEPRECATED - Upload an image file
 *     tags: [Upload]
 *     description: This endpoint is deprecated. Use /api/uploadthing instead.
 *     deprecated: true
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
 *       410:
 *         description: Endpoint deprecated
 */
// router.post('/', ...) - Removed

/**
 * @swagger
 * /upload/{id}:
 *   get:
 *     summary: Get information about an uploaded file by its database ID
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The media ID stored in the database
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media' # Assuming you have a Media schema defined
 *       400:
 *         description: Invalid media ID
 *       404:
 *         description: File not found in database
 *       500:
 *         description: Server error
 */

// Get media file information by ID from the database
router.get('/:id', async (req, res, next) => {
  try {
    const mediaId = parseInt(req.params.id);

    if (isNaN(mediaId)) {
      return res.status(400).json({ error: 'Invalid media ID' });
    }

    const media = await db.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Return the media details stored in the database
    // Note: This does not serve the file itself, just its metadata
    res.status(200).json(media);
  } catch (error) {
    console.error('Error retrieving media:', error);
    next(error);
  }
});

module.exports = router;