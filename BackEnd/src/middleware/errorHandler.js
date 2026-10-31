const fs = require('fs');
const multer = require('multer');
const { HttpError } = require('../utils/httpError');

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

// One place that turns every error into a safe JSON response.
// Never sends stack traces or raw error objects to the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // An upload that ended in an error must not stay on disk.
  if (req.file?.path) fs.unlink(req.file.path, () => {});

  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message, ...err.extra });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : 'Invalid upload';
    return res.status(400).json({ success: false, message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Malformed JSON body' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid id or value format' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation failed' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  console.error('[error]', req.method, req.originalUrl, '-', err.message);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  return res.status(500).json({ success: false, message: 'Internal Server Error' });
}

module.exports = { notFound, errorHandler };
