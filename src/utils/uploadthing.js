const { createUploadthing } = require("uploadthing/express");
const { db } = require('./db');

// Create an instance of uploadthing
const f = createUploadthing();

// Define file routes with their configurations
const uploadRouter = {
  // Define the "imageUploader" route for images
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this route
    .middleware(({ req }) => {
      // This code runs on your server before upload
      const userId = req.headers.userid || req.user?.id || "anonymous";
      
      // If you throw, the user will not be able to upload
      if (!userId) throw new Error("Unauthorized");
      
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      
      // Store file information in the database
      const newMedia = await db.media.create({
        data: {
          alt: file.name || 'Uploaded image',
          key: file.key,
          filename: file.name,
          mime_type: file.type || 'image/jpeg',
          filesize: file.size,
          url: file.url,
          width: 0,
          height: 0
        }
      });
      
      // Return file info and database record ID
      return { 
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileKey: file.key, 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        mediaId: newMedia.id
      };
    }),
};

module.exports = {
  uploadRouter,
};