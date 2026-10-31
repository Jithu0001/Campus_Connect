const multer = require("multer");
const storage = multer.memoryStorage();
// Extension comes from the allow-list below, never from the user's filename.
const ALLOWED = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only jpeg, png, gif files are allowed!"),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});
module.exports = { upload };
