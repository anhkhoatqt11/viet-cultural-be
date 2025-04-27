const express = require('express');
const router = express.Router();
const { createUploadthingExpressHandler } = require('uploadthing/express');
const { ourFileRouter } = require('../../utils/uploadthing');


// UploadThing handler (see https://docs.uploadthing.com/api-reference/server#create-uploadthing)
router.use('/', createUploadthingExpressHandler({ router: ourFileRouter }));

module.exports = router;