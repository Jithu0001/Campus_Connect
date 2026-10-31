const fs = require('fs');
const path = require('path');
const { UPLOADS_DIR } = require('../config/paths');

// Deletes an uploaded image given the value stored on a complaint ("uploads/<name>").
// Refuses anything that resolves outside the uploads folder (path traversal safety).
function removeUploadedFile(storedPath) {
  if (!storedPath) return;
  const target = path.resolve(UPLOADS_DIR, path.basename(String(storedPath)));
  if (!target.startsWith(UPLOADS_DIR + path.sep)) return;
  fs.unlink(target, () => {}); // best effort; ignore "file not found"
}
module.exports = { removeUploadedFile };
