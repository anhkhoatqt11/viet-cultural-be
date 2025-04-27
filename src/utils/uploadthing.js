const { createUploadthing } = require("uploadthing/server");
const { UploadThingError } = require("uploadthing/server");

// Initialize UploadThing
const f = createUploadthing();

// Authentication/authorization handler
const handleAuth = (req) => {
  // You should implement your own auth logic here
  // This should check if the user is authorized to upload
  
  if (!req.userId) {
    throw new UploadThingError("Unauthorized");
  }
  
  return { userId: req.userId };
};

// Define file routes
const uploadRouter = {
  // Define file route for post images
  postImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(({ req }) => handleAuth(req))
    .onUploadComplete(({ metadata, file }) => {
      // This is triggered when the upload is complete
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      // Return file details for the client
      return {
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size
      };
    }),
};

module.exports = { uploadRouter };