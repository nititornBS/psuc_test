const { custom, success, failed } = require("./response");

const fs = require("fs");
const { google } = require("googleapis");
const multer = require("multer");
const util = require("util");
const { Readable } = require("stream"); // Import the Readable class

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

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = {
  uploadfile: [
    upload.single("file"),
    async (req, res) => {
      try {
        const file = req.file;
        const company_id = req.body.id;
        console.log({ company_id });
        if (!file) {
          failed(res, "File not found in the request!", null);
          return;
        }

        // Create a readable stream from the file buffer
        const fileStream = new Readable();
        fileStream.push(file.buffer);
        fileStream.push(null);
        const currentDate = new Date().toISOString().replace(/[-T:]/g, "");
        const filename = `${company_id}_${currentDate}_${file.originalname}`;

        // Upload the file to Google Drive
        const driveResponse = await drive.files.create({
          requestBody: {
            name: filename,
            mimeType: file.mimetype,
            parents: ["1xKIVlfHjndVFW6Gm6w0TqhKOW84i0U0T"],
          },
          media: {
            mimeType: file.mimetype,
            body: fileStream, // Use the readable stream
          },
        });

        // Optionally, you can log the Google Drive response
        console.log("Google Drive Response:", driveResponse.data);

        success(
          res,
          "File uploaded to Google Drive successfully!",
          {},
          { filename }
        );
      } catch (error) {
        failed(res, "Internal Server Error!", error.message);
      }
    },
  ],
  downloadfile: async (req, res) => {
    const filename = req.body.filename; // Assuming you pass the filename as a query parameter
    if (!filename) {
      failed(res, "Filename parameter is missing!", null);
      return;
    }

    try {
      const response = await drive.files.list({
        q: `name='${filename}'`,
        fields: "files(id, name)",
      });

      const files = response.data.files;

      if (!files || files.length === 0) {
        failed(res, "File not found on Google Drive!", null);
        return;
      }

      const fileId = files[0].id;

      const fileResponse = await drive.files.get(
        {
          fileId: fileId,
          alt: "media",
        },
        { responseType: "stream" }
      );

      // Pipe the file stream to the response
      fileResponse.data
        .on("end", () => {
          console.log("File downloaded successfully!");
        })
        .on("error", (err) => {
          console.error("Error downloading file:", err);
          failed(res, "Error downloading file", err.message);
        })
        .pipe(res);
    } catch (error) {
      console.error("Error searching for file:", error);
      failed(res, "Error searching for file", error.message);
    }
  },
};
