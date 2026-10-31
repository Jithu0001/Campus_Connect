const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Simple word-score urgency. Kept exactly as before; the AI triage feature will replace it.
function analyzeUrgency(description) {
  const { score } = sentiment.analyze(description);
  if (score >= 0) return 'Low';
  if (score <= -3) return 'High';
  return 'Medium';
}
module.exports = { analyzeUrgency };
