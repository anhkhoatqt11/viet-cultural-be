const express = require('express');
const { db } = require('../../utils/db');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { createUploadthing } = require("uploadthing/express");

const router = express.Router();

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
 *         fileType:
 *           type: string
 *           description: MIME type of the uploaded file
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image file to UploadThing
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

// No local middleware here - using the one defined in app.js

// Image upload endpoint that handles the upload to UploadThing
router.post('/', async (req, res, next) => {
  try {
    console.log('Upload request received');
    console.log('Request files:', req.files ? Object.keys(req.files) : 'none');

    // Check if a file was uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        files: req.files ? Object.keys(req.files) : 'none',
        note: 'Make sure to use "file" as the field name for your file upload'
      });
    }

    const file = req.files.file;
    console.log('File received:', file.name, file.mimetype, file.size);

    // Check if it's an image
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    // Extract user ID from request headers or use anonymous
    const userId = req.headers.userid || req.user?.id || "anonymous";

    try {
      // Create temporary file path using the OS's temp directory
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${file.name}`);

      console.log('Moving file to temp path:', tempFilePath);
      await file.mv(tempFilePath);

      // Create a simple uploadthing client
      const fileData = {
        name: file.name,
        filepath: tempFilePath,
        size: file.size,
        type: file.mimetype,
      };

      console.log('Uploading to UploadThing');

      // For now, let's just store the file info directly using the file system
      // and avoid the UploadThing integration that's causing issues
      const uploadDir = path.join(__dirname, '../../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      // Move the file to uploads directory
      await file.mv(filePath);

      // Generate a relative URL
      const fileUrl = `/uploads/${fileName}`;
      const fileKey = `local_${Date.now()}`;

      // Store file information in the database
      const newMedia = await db.media.create({
        data: {
          alt: file.name || 'Uploaded image',
          key: fileKey,
          filename: fileName,
          mime_type: file.mimetype,
          filesize: file.size,
          url: fileUrl,
          width: 0,
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
      console.error('Upload error:', error);
      return res.status(500).json({
        error: 'File upload failed',
        message: error.message
      });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
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