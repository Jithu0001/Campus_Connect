const request = require('supertest');

// Loads a fresh copy of a module with temporary environment variables.
function withEnv(overrides, load) {
  const keys = Object.keys(overrides);
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  keys.forEach((k) => (overrides[k] === undefined ? delete process.env[k] : (process.env[k] = overrides[k])));
  try {
    let out;
    jest.isolateModules(() => { out = load(); });
    return out;
  } finally {
    keys.forEach((k) => (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k])));
  }
}
const GOOD = { ACCESS_TOKEN_SECRET: 'a'.repeat(48), REFRESH_TOKEN_SECRET: 'b'.repeat(48) };
const loadEnv = (o) => withEnv({ ...GOOD, ...o }, () => require('../src/config/env'));

describe('environment validation', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  test('missing secret -> startup error', () => {
    expect(() => loadEnv({ ACCESS_TOKEN_SECRET: undefined })).toThrow(/ACCESS_TOKEN_SECRET/);
  });
  test('identical secrets -> startup error', () => {
    expect(() => loadEnv({ REFRESH_TOKEN_SECRET: GOOD.ACCESS_TOKEN_SECRET })).toThrow(/different/);
  });
  test('short secrets only warn in development but fail in production', () => {
    expect(() => loadEnv({ ACCESS_TOKEN_SECRET: 'short', NODE_ENV: 'development' })).not.toThrow();
    expect(() => loadEnv({ ACCESS_TOKEN_SECRET: 'short', NODE_ENV: 'production', CORS_ORIGINS: 'https://a.com' })).toThrow(/32 characters/);
  });
  test('production requires CORS_ORIGINS', () => {
    expect(() => loadEnv({ NODE_ENV: 'production', CORS_ORIGINS: undefined })).toThrow(/CORS_ORIGINS/);
  });
  test('defaults and parsing', () => {
    const env = loadEnv({ CORS_ORIGINS: ' https://a.com , https://b.com ', PORT: undefined, MONGO_URI: undefined, TRUST_PROXY: '1' });
    expect(env.corsOrigins).toEqual(['https://a.com', 'https://b.com']);
    expect(env.PORT).toBe(8000);
    expect(env.MONGO_URI).toBe('mongodb://localhost:27017/Campus_Connect');
    expect(env.TRUST_PROXY).toBe(1);
  });
});

describe('CORS allow-list', () => {
  test('only configured origins get CORS headers', async () => {
    const app = withEnv({ ...GOOD, CORS_ORIGINS: 'https://good.example' }, () => require('../src/app'));
    const good = await request(app).get('/health').set('Origin', 'https://good.example');
    const evil = await request(app).get('/health').set('Origin', 'https://evil.example');
    expect(good.headers['access-control-allow-origin']).toBe('https://good.example');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });
});
