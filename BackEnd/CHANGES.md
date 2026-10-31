# Campus Connect backend - Phase 0 (security) + controller/service restructure

## 1. Do these 5 things before running it
1. **Rotate secrets.** Your old `.env` (JWT secrets, Gmail app password) was shared outside your machine. Create new ones:
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` (run twice - the two JWT secrets must differ, 32+ chars). Revoke the old Gmail app password and make a new one.
2. Copy `.env.example` to `.env` and fill it in. New/changed variables: `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` (required), `CORS_ORIGINS` (required in production), `TRUST_PROXY`, `MONGO_URI` (optional, defaults to your old local URL).
3. `npm install` then `npm run dev`. Tests: `npm test`.
4. One-time DB cleanup - old refresh tokens are stored in plain text; clear them (everyone just logs in again):
   `db.students.updateMany({}, {$set:{refreshToken:null}}); db.hods.updateMany({}, {$set:{refreshToken:null}}); db.admins.updateMany({}, {$set:{refreshToken:null}})`
5. Copy your existing `uploads/` images into the new `uploads/` folder.

## 2. Security fixes
| # | Problem (before) | Fix (now) | Where |
|---|---|---|---|
| 1 | `authStudent/authHod/authAdmin` were identical - any logged-in user could call any route (even create admins) | one `authenticate` + `requireRole(...)`; every route declares its roles | `middleware/auth.js`, all `*.routes.js` |
| 2 | `PUT /modify-complaint/:id` had no auth at all | HOD-only, must be the assigned HOD, not escalated, status limited to In-Progress/Resolved/Closed | `complaints.*` |
| 3 | IDOR: any student could delete any complaint / read any pin's complaints; any HOD could read another HOD's | identity comes from the token only; owner is part of the DB query; URL `:pinNo` / `:id` must match the token else 403 | `complaints.service.js` |
| 4 | Anonymous complaints exposed `studentPinNo`/`submittedBy` to HODs and admins | removed from HOD/admin responses | `complaints/present.js` |
| 5 | Login/register/list endpoints returned password hashes and refresh tokens | `select:false` + `toJSON` strip on the schemas | `models/user.model.js` |
| 6 | Mass assignment (`{...req.body}`) - callers could set `role` etc.; schema default password `'12345'` | zod schemas keep only listed fields; default removed; `role` is immutable; password min 8 | `users.schemas.js` |
| 7 | `POST /api/complaint-email` was public (free spam relay) | deleted | `app.js` |
| 8 | Refresh endpoint threw on every call; refresh tokens stored in plain text | fixed; tokens stored as SHA-256; rotation is atomic (each token works once) | `auth/*` |
| 9 | Login: different messages for unknown email vs wrong password; NoSQL-injection possible (`{"$gt":""}`) | same message, timing-equalised; inputs must be strings; per (IP+email) rate limit | `auth.*`, `rateLimiters.js` |
| 10 | JWTs: no algorithm pinned; admin token had no admin id | `HS256` only; `adminId` added | `tokens.js`, `auth.js` |
| 11 | No helmet, open CORS, unlimited body size, no rate limiting | helmet, CORS allow-list, 100kb JSON limit, global + login limiters | `app.js` |
| 12 | Uploads: extension taken from user filename, any `image/*`-looking name accepted, orphan files, no size limit | allow-list (jpg/png/gif), random name, 5MB, orphans deleted on error, image deleted on withdraw | `middleware/upload.js`, `errorHandler.js` |
| 13 | Raw `err` objects sent to the client | one error handler, safe messages, stack only in server log | `errorHandler.js` |
| 14 | Email: TLS verification disabled; HTML injection via complaint title | removed `rejectUnauthorized:false`; all values HTML-escaped | `email.service.js` |
| 15 | Config: hardcoded Mongo URL, no env validation, server started even if DB failed | validated env at boot (fails fast), server exits if DB unreachable | `config/env.js`, `server.js` |
| 16 | Dependencies with known CVEs (axios, nodemailer, express sub-deps) | upgraded; `npm audit --omit=dev` = 0 vulnerabilities | `package.json` |
| 17 | Duplicate-title check was global (blocked other students, leaked existence) | scoped to the same student | `complaints.service.js` |

## 3. Bugs fixed on the way
- `/all-departments` was registered twice (admin + student). With real role checks that would have locked students out - now one route for all roles.
- Admin "modify complaint" crashed on an unknown id and had dead `"Re-Solved"` code - now a clean 404.
- "Add department" crashed (500) when no HOD matched the branch - now a clean 404.
- Escalation job re-escalated already-escalated complaints every night (overwriting `escalatedAt`) and ran one query per complaint - now one `updateMany` per department, runs in `Asia/Kolkata` time.
- `escalatedBy/escalatedTo` pointed at model name `'admins'`; the model is `'Admins'` - fixed.
- Email transporter opened a network connection just by being imported - now lazy.
- `nodemon` moved to devDependencies; unused `router` package removed.

## 4. Restructure (old -> new)
```
index.js                      -> index.js (3 lines) -> src/server.js (DB + cron + listen) / src/app.js (express app)
Models/userModel.js           -> src/models/user.model.js
Models/complaintModel.js      -> src/models/complaint.model.js
Models/settingModel.js        -> src/models/department.model.js
Middlewares/authMiddleware.js -> src/middleware/auth.js (+ validate, rateLimiters, upload, errorHandler)
Routers/authRoute.js          -> src/modules/auth/        (+ the 3 login routes)
Routers/adminRoute.js         -> src/modules/users/ + departments/ + admin part of complaints/
Routers/studentRoute.js       -> src/modules/complaints/ (student part)
Routers/hodRoute.js           -> src/modules/complaints/ (hod part)
Jobs/escalationJob.js         -> src/jobs/escalation.job.js
utils/emailService.js         -> src/modules/notifications/email.service.js (+ notifications.service.js)
```
Each module: `routes` (URL + middleware) -> `controller` (HTTP in/out) -> `service` (business rules + DB) + `schemas` (validation).
**All URLs are unchanged.** Model names are unchanged, so your MongoDB data works as is.

## 5. Behaviour changes your frontend may notice
| Change | What to do in the frontend |
|---|---|
| Failures now use real status codes (400 validation, 401 not logged in, 403 not allowed, 404 not found/not yours, 409 duplicate, 429 too many requests) with `{success:false, message}`. **Login failure is still HTTP 200 + `success:false`** | In `catch`, show `err.response?.data?.message` |
| Login/registration responses no longer include `password` / `refreshToken` | nothing, unless the UI read them |
| HOD/admin no longer receive `studentPinNo`/`submittedBy` on anonymous complaints | nothing |
| `Authorization` header must be `Bearer <token>` | check axios setup |
| Passwords for new accounts need 8+ characters | update register form hint |
| HODs can only set In-Progress / Resolved / Closed (`HOD_STATUSES` in `complaints.schemas.js`) | adjust the list if your UI needs others |
| Refresh tokens rotate: use the NEW `refreshToken` returned by `/api/refresh-token` | store the new one each time |
| Image path is stored with `/` (`uploads/image-....jpg`) | nothing on most setups |
| Registration with an existing email still answers 200 `{success:false,message}`; duplicate pin/ids answer 409 | nothing |

## 6. Still open (next phases, not done here)
- `/uploads` is still publicly readable (browser `<img>` can't send a token). Phase 1: Cloudinary / signed URLs.
- Uploads are checked by declared type, not by file contents (magic bytes).
- Anonymous complaints still store `studentPinNo` in the database (hidden from HOD/admin responses, not from the DB). Phase 2: separate locked identity collection.
- Complaint status rules (who may move what to what) and a history log - Phase 2.
- Three user collections, department stored as a string, no indexes/pagination - Phase 2.
- Email still uses Gmail SMTP (blocked on Render free) and the escalation still runs in-process - Phase 1.
- Escalation still picks the first admin account.
- No account lockout beyond rate limiting; no password-change / reset flow.

## 7. Tests (`npm test`) - 189 checks
Role matrix for all 17 protected routes (no token / garbage / expired / wrong secret / `alg:none` / refresh-as-access / each wrong role), ownership checks, anonymity, secrets never in responses, mass assignment, NoSQL injection, refresh rotation and reuse, upload rules and orphan cleanup, rate limiting, error handling, env validation, CORS allow-list, escalation job.
**These tests mock the database.** They prove the permission and validation logic; they do not prove your real MongoDB queries. Run the manual checks in section 8 once against your real database.

## 8. Manual check against your real DB (10 minutes)
1. Log in as student/HOD/admin; confirm responses contain tokens but no `password`.
2. With the student token: `GET /api/all-complaints`, `GET /api/students`, `POST /api/register-admin` -> all **403**.
3. With the HOD token: `GET /api/all-complaints` -> **403**.
4. Student A: `GET /api/my-complaints/<B's pin>` -> **403**; `DELETE .../withdraw-complaint/<B's complaint id>` -> **404**.
5. Raise an anonymous complaint, then fetch it as the HOD: no `studentPinNo`.
6. `POST /api/refresh-token` twice with the same token: first 200, second 403.
