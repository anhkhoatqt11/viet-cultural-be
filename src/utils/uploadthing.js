const { createUploadthing, UploadThingError } = require("uploadthing/express");
const { db } = require("./db"); // Assuming db is accessible here

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   * @see https://docs.uploadthing.com/errors#error-formatting
   */
  errorFormatter: (err) => {
    console.log("Error uploading file", err.message);
    console.log("  - Above error caused by:", err.cause);

    return { message: err.message };
  },
});

// FileRouter for your app, can contain multiple FileRoutes
const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1
    }
  })
  // Set permissions and file types for this FileRoute
  // .middleware(async ({ req, res }) => {
  //   // This code runs on your server before upload
  //   // Perform any necessary authentication or validation here
  //   // const user = await getUserFromReq(req); // Example: Get user
  //   // if (!user) throw new UploadThingError("Unauthorized");
  //   // Whatever is returned here is accessible in onUploadComplete
  //   // return { userId: user.id };
  //   console.log("Middleware check passed for request:", req.headers);
  //   return { uploadedBy: 'server-middleware' }; // Example static data
  // })
  .onUploadComplete(async ({ metadata, file }) => {
    // This code RUNS ON YOUR SERVER after upload
    console.log("Upload complete for userId:", metadata.uploadedBy); // Example access middleware data
    console.log("file url", file.url);
    console.log("file details:", file);

    // Save file metadata to your database
    try {
      const newMedia = await db.media.create({
        data: {
          alt: file.name || 'Uploaded image',
          key: file.key,
          filename: file.name,
          mime_type: file.type || 'unknown', // Get type from file object
          filesize: file.size,
          url: file.url,
          width: 0, // Consider adding image dimension extraction if needed
          height: 0,
          // uploadedById: metadata.userId // Example: Link to user if using middleware auth
        }
      });
      console.log("Successfully saved media to DB:", newMedia.id);
      // Return whatever you need accessible client-side (optional)
      // The default response includes { uploadedBy: metadata.uploadedBy, file: { url, key, name, size } }
      // You could add the db id here if needed by the client immediately
      return { ...file, dbId: newMedia.id };
    } catch (dbError) {
      console.error("Failed to save media to DB:", dbError);
      // Even if DB save fails, UploadThing considers the upload successful.
      // Handle this case appropriately (e.g., logging, cleanup task)
      // Throwing an error here won't stop UploadThing returning 200 OK
      // but will prevent the custom return value above.
      throw new UploadThingError("Database update failed after upload.");
    }
  }),
  // Add other routes like 'videoUploader', 'rawFileUploader' etc. as needed
};

module.exports = { ourFileRouter };