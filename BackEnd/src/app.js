const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const { UPLOADS_DIR } = require('./config/paths');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Behind a reverse proxy (Render, nginx...) set TRUST_PROXY=1 so rate limiting sees the real client IP.
if (env.TRUST_PROXY) app.set('trust proxy', env.TRUST_PROXY);

// Security headers. cross-origin is allowed for resources so the frontend (on another
// origin) can still display images from /uploads.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Only the listed frontend origins may call the API from a browser.
app.use(cors({ origin: env.corsOrigins.length ? env.corsOrigins : true }));

app.use(express.json({ limit: '100kb' }));

// Uploaded complaint images (still public in this phase - see CHANGES.md "Still open").
app.use('/uploads', express.static(UPLOADS_DIR, { index: false, dotfiles: 'deny' }));

app.get('/', (req, res) => res.send('Server is running!!Complaint Management System.'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', apiLimiter);
app.use('/api', require('./modules/auth/auth.routes'));
app.use('/api', require('./modules/users/users.routes'));
app.use('/api', require('./modules/departments/departments.routes'));
app.use('/api', require('./modules/complaints/complaints.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
