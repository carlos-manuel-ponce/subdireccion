import request from 'supertest';
import { createServer } from 'http';
import app from '../index';

describe('API health', () => {
  it('responde a /api con 200', async () => {
    const server = createServer(app);
    const res = await request(server).get('/api');
    expect(res.statusCode).toBe(200);
  });
});
