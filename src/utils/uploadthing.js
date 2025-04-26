const { createUploadthing } = require("uploadthing/express");

// Create an instance of uploadthing with proper typing
const f = createUploadthing();

// Define file routes with their configurations
const uploadRouter = {
  // Define the "imageUploader" route for post images
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this route
    .middleware(({ req }) => {
      // This code runs on your server before upload
      const userId = req.headers.userid || "anonymous";
      
      // If you throw, the user will not be able to upload
      if (!userId) throw new Error("Unauthorized");
      
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      
      // !!! Whatever is returned here will be sent to the client !!!
      return { 
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileKey: file.key, 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    }),
};

module.exports = {
  uploadRouter,
};