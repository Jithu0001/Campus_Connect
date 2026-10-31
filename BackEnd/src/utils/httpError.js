// Throw this from services/controllers. The error handler turns it into a JSON response.
class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.extra = extra; // extra fields merged into the JSON body
  }
}
module.exports = { HttpError };
