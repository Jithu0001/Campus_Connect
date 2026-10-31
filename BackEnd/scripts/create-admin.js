/**
 * One-off script: creates the FIRST admin account in a fresh database.
 * (Registering an admin through the API needs an admin token, so an empty database
 *  would otherwise lock you out.)
 *
 * Usage - the password is read from an environment variable so it never ends up
 * in your shell history or on screen:
 *
 *   PowerShell:  $env:ADMIN_PASSWORD='YourLongPassword1'; node scripts/create-admin.js "Full Name" ADMIN001 admin@college.edu
 *   cmd.exe:     set ADMIN_PASSWORD=YourLongPassword1
 *                node scripts/create-admin.js "Full Name" ADMIN001 admin@college.edu
 *   Mac/Linux:   ADMIN_PASSWORD='YourLongPassword1' node scripts/create-admin.js "Full Name" ADMIN001 admin@college.edu
 *
 * It uses MONGO_URI from your .env, so point that at Atlas first to create the admin there.
 */
const mongoose = require('mongoose');
const env = require('../src/config/env');
const { adminModel } = require('../src/models/user.model');
const usersService = require('../src/modules/users/users.service');
const { registerAdminSchema } = require('../src/modules/users/users.schemas');

const USAGE =
  'Usage: ADMIN_PASSWORD=<password> node scripts/create-admin.js "<Full Name>" <adminId> <email>';

// Checks the input with the SAME rules as the register-admin API (name length, email
// format, password 8-72 chars), so a script-created admin is never weaker than an API one.
function parseInput(args, password) {
  const [name, adminId, email] = args;
  if (!name || !adminId || !email || !password) {
    return { ok: false, message: USAGE };
  }
  const parsed = registerAdminSchema.safeParse({ name, adminId, email, password });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: `Invalid ${issue.path.join('.')}: ${issue.message}` };
  }
  return { ok: true, data: parsed.data };
}

// Never throws for expected problems; returns { ok, message }. The password is never echoed.
async function createAdmin(data) {
  try {
    // Same code path as POST /api/register-admin: checks the email is free, hashes the
    // password with bcrypt, and saves.
    const result = await usersService.register('admin', data);
    if (result.alreadyRegistered) {
      return { ok: false, message: `An admin with the email ${data.email} already exists.` };
    }
    return { ok: true, message: `Admin created: ${data.email} (adminId ${data.adminId})` };
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'value';
      return { ok: false, message: `That ${field} is already in use.` };
    }
    throw err;
  }
}

async function main() {
  // Check the input BEFORE touching the network, so typos fail instantly.
  const input = parseInput(process.argv.slice(2), process.env.ADMIN_PASSWORD);
  if (!input.ok) {
    console.error(input.message);
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  try {
    // Printed so you can see WHICH database you are about to change. On Atlas, "test"
    // here means your connection string has no database name in it.
    console.log(`Connected to database "${mongoose.connection.name}" on ${mongoose.connection.host}`);
    await adminModel.init(); // make sure the unique indexes exist before inserting

    const result = await createAdmin(input.data);
    console.log(result.message);
    process.exitCode = result.ok ? 0 : 1;
  } finally {
    // Without this the open database connection keeps Node alive and the script never exits.
    await mongoose.disconnect();
  }
}

module.exports = { parseInput, createAdmin, main };

if (require.main === module) {
  main().catch((err) => {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  });
}