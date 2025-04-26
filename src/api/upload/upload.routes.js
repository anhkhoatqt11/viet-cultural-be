const express = require("express");
const { createRouteHandler } = require("uploadthing/server");
const { uploadRouter } = require("../../utils/uploadthing");

const router = express.Router();


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

// Create UploadThing route handler
const handler = createRouteHandler({
  router: uploadRouter,
  config: {
    // Your UploadThing app ID from the dashboard
    uploadthingId: process.env.UPLOADTHING_APP_ID,
    // Your UploadThing API key
    uploadthingSecret: process.env.UPLOADTHING_SECRET,
  },
});

// No auth middleware
router.get("/", handler);
router.post("/", handler);

module.exports = router;
