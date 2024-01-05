const { custom, success, failed } = require("../helpers/response");
const { envJWTKEY } = require("../helpers/env");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { google } = require("googleapis");
const multer = require("multer");
const util = require("util");



// Google Drive API credentials
const credentials = require("../../psucc-410214-34eee0cf6b58.json");
const drive = google.drive({
  version: "v3",
  auth: new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/drive"]
  ),
});

module.exports = {
  uploadfile: async (req, res) => {
    try {
      const file = req.file; // Assuming that the file is attached to the request
      console.log({ file });
      if (!file) {
        failed(res, "File not found in the request!", null);
        return;
      }

      // Upload the file to Google Drive
      const driveResponse = await drive.files.create({
        requestBody: {
          name: file.originalname,
          mimeType: file.mimetype,
          parents: ["1xKIVlfHjndVFW6Gm6w0TqhKOW84i0U0T"],
        },
        media: {
          mimeType: file.mimetype,
          body: fs.createReadStream(file.path),
        },
      });

      // Optionally, you can log the Google Drive response
      console.log("Google Drive Response:", driveResponse.data);

      success(res, "File uploaded to Google Drive successfully!", {}, null);
    } catch (error) {
      failed(res, "Internal Server Error!", error.message);
    }
  },
};
