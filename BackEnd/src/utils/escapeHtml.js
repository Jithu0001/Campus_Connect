// Escapes user-controlled text before it is placed inside an HTML email.
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => MAP[c]);
module.exports = { escapeHtml };
