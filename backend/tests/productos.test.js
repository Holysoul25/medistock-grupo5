const request = require('supertest');
const app = require('../app');

describe('GET /health', () => {
  it('debe responder con status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

describe('GET /api/v1/productos', () => {
  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/v1/productos');
    expect(res.statusCode).toBe(401);
  });
});
