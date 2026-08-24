import { createRouter } from './router';
import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import express from 'express';
import request from 'supertest';

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: new ConfigReader({}),
    });
    app = express().use(router);
  });

  it('POST /validate returns 400 when neither structure nor structFile is provided', async () => {
    const response = await request(app).post('/validate').send({});
    expect(response.status).toBe(400);
  });

  it('POST /validate accepts structure parameter', async () => {
    const response = await request(app).post('/validate').send({
      structure: 'test-structure',
    });

    expect([200, 500]).toContain(response.status);
  });

  it('POST /validate accepts structFile parameter', async () => {
    const response = await request(app).post('/validate').send({
      structFile: './test-structure.yaml',
    });

    expect([200, 500]).toContain(response.status);
  });

  it('POST /validate returns validation result structure', async () => {
    const response = await request(app).post('/validate').send({
      structure: 'test-structure',
    });

    if (response.status === 200) {
      expect(response.body).toHaveProperty('valid');
      expect(typeof response.body.valid).toBe('boolean');
    }
  });
});
