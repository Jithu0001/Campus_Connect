const cloudinary = require('cloudinary').v2;
const env = require('../config/env');
const { HttpError } = require('../utils/httpError');

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// KEEP THIS LIST IN SYNC with the allow-list in middleware/upload.js.
const UPLOAD_OPTIONS = {
  folder: 'Campus_Connect/complaints',
  resource_type: 'image',
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
};

// Turns a Cloudinary error into an HttpError the API can send to the client.
//  - 400 from Cloudinary = the FILE is the problem (corrupt, wrong format)  -> tell the student
//  - anything else (bad API keys, outage, rate limit) = OUR problem         -> generic 502
function toHttpError(error) {
  console.error('[cloudinary] upload failed:', error.http_code, error.message);
  if (error.http_code === 400) {
    return new HttpError(400, 'One of the images is invalid or not a supported format (jpg, png).');
  }
  return new HttpError(502, 'Image storage is unavailable right now. Please try again later.');
}

// Uploads ONE image buffer. Resolves { url, publicId }. Rejects with an HttpError.
// (It returns only what the rest of the app needs, so Cloudinary's field names
//  never leak outside this file.)
function uploadToCloudinaryStream(fileBuffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(UPLOAD_OPTIONS, (error, result) => {
      if (error) return reject(toHttpError(error));
      return resolve({ url: result.secure_url, publicId: result.public_id });
    });
    uploadStream.end(fileBuffer); // write the bytes into the pipe and close it
  });
}

// Deletes ONE image. NEVER throws: callers use it for cleanup, and a failed cleanup
// must not break the request. Always returns { success, ... }.
async function deleteFromCloudinary(publicId) {
  if (!publicId) return { success: false, error: 'No public_id provided' };
  try {
    // invalidate: ask the CDN to stop serving its cached copy of the deleted image
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    if (result.result === 'ok') return { success: true };
    if (result.result === 'not found') return { success: true, alreadyGone: true };
    return { success: false, error: `Cloudinary answered: ${result.result}` };
  } catch (error) {
    console.error('[cloudinary] deletion failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Deletes several images. NEVER throws. Returns one result per id.
function deleteManyFromCloudinary(publicIds = []) {
  return Promise.all(publicIds.map((id) => deleteFromCloudinary(id)));
}

// Uploads several images IN PARALLEL with ALL-OR-NOTHING behaviour:
// if any upload fails, the ones that already succeeded are deleted and the error is thrown.
// Resolves an array of { url, publicId } in the SAME ORDER as the input buffers.
async function uploadManyToCloudinary(buffers = []) {
  if (buffers.length === 0) return [];

  // allSettled waits for EVERY upload to finish, so we know exactly which ones succeeded.
  // (Promise.all would reject at the first failure and we'd lose track of the others.)
  const outcomes = await Promise.allSettled(buffers.map((buffer) => uploadToCloudinaryStream(buffer)));

  const failure = outcomes.find((o) => o.status === 'rejected');
  if (failure) {
    const orphans = outcomes.filter((o) => o.status === 'fulfilled').map((o) => o.value.publicId);
    await deleteManyFromCloudinary(orphans); // roll back, never throws
    throw failure.reason;
  }
  return outcomes.map((o) => o.value);
}

module.exports = {
  uploadToCloudinaryStream,
  uploadManyToCloudinary,
  deleteFromCloudinary,
  deleteManyFromCloudinary,
};