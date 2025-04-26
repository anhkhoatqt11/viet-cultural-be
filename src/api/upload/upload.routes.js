const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../../utils/db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use /tmp/uploads on Vercel or fallback to local uploads folder
    const isVercel = process.env.VERCEL || process.env.NOW_REGION;
    const uploadDir = isVercel
      ? '/tmp/uploads'
      : path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints for image management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the upload was successful
 *         mediaId:
 *           type: number
 *           description: ID of the created media record
 *         fileUrl:
 *           type: string
 *           description: URL to access the uploaded file
 *         fileKey:
 *           type: string
 *           description: Unique key for the file in storage
 *         fileName:
 *           type: string
 *           description: Original name of the uploaded file
 *         fileSize:
 *           type: number
 *           description: Size of the file in bytes
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image file
 *     tags: [Upload]
 *     description: Upload image files for use in posts and other content
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
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: No file uploaded or invalid file
 *       500:
 *         description: Server error during upload
 */

// Image upload endpoint using multer
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = req.file;
    const fileKey = `upload_${Date.now()}`;
    const fileName = uploadedFile.filename;

    // Get the relative path for storage in the database
    const fileUrl = `/uploads/${fileName}`;

    // Store file information in the database
    const newMedia = await db.media.create({
      data: {
        alt: uploadedFile.originalname || 'Uploaded image',
        key: fileKey,
        filename: fileName,
        mime_type: uploadedFile.mimetype,
        filesize: uploadedFile.size,
        url: fileUrl, // Relative URL to access the file
        width: 0, // You may add image processing to get actual dimensions
        height: 0
      }
    });

    // Return success response with file information
    res.status(200).json({
      success: true,
      mediaId: newMedia.id,
      fileUrl: newMedia.url,
      fileKey: newMedia.key,
      fileName: newMedia.filename,
      fileSize: newMedia.filesize,
      fileType: newMedia.mime_type
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    if (req.file) {
      // Clean up file if database operation failed
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    next(error);
  }
});

/**
 * @swagger
 * /upload/{id}:
 *   get:
 *     summary: Get information about an uploaded file
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The media ID
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */

// Get media file information by ID
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

    res.status(200).json(media);
  } catch (error) {
    console.error('Error retrieving media:', error);
    next(error);
  }
});

module.exports = router;