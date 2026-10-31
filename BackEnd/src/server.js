const mongoose = require('mongoose');
const env = require('./config/env');
const app = require('./app');
const { scheduleEscalation } = require('./jobs/escalation.job');
// const { verifyEmailTransport } = require('./modules/notifications/email.service');

async function start() {
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to Database');

  scheduleEscalation();
  // verifyEmailTransport(); // logs a warning if email isn't configured; never blocks startup

  const server = app.listen(env.PORT, () => console.log(`Listening to port ${env.PORT}`));

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
