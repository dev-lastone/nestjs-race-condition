import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('Coupon Concurrency Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('db-lock', async () => {
    const couponId = 1;
    const userIds = Array.from({ length: 200 }, (_, i) => i + 1);

    const results = await mapWithConcurrency(
      userIds,
      async (userId: number) => {
        const response = await request(app.getHttpServer())
          .post(`/coupons/${couponId}/issue/${userId}/db-lock`)
          .send();
        return { userId, message: response.text };
      },
      50, // 동시성 제한
    );

    const successCount = results.filter((result) => !result.message).length;
    const failureCount = results.filter((result) => result.message).length;

    console.log('성공한 요청 수:', successCount);
    console.log('실패한 요청 수:', failureCount);

    expect(successCount).toBeLessThanOrEqual(100);
    expect(failureCount).toBeGreaterThanOrEqual(100);
  });

  it('redis-lua', async () => {
    const couponId = 1;
    const userIds = Array.from({ length: 100 }, (_, i) => i + 1);

    const results = await mapWithConcurrency(
      userIds,
      async (userId: number) => {
        const response = await request(app.getHttpServer())
          .post(`/coupons/${couponId}/issue/${userId}/redis-lua`)
          .send();
        return { userId, message: response.text };
      },
      2, // 동시성 제한
    );

    const successCount = results.filter((result) => !result.message).length;
    const failureCount = results.filter((result) => result.message).length;

    console.log('성공한 요청 수:', successCount);
    console.log('실패한 요청 수:', failureCount);

    expect(successCount).toBeLessThanOrEqual(100);
    expect(failureCount).toBeGreaterThanOrEqual(100);
  });
});

async function mapWithConcurrency(items, mapper, concurrency) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const promise = Promise.resolve().then(() => mapper(item));
    results.push(promise);

    if (concurrency <= items.length) {
      const e = promise.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(results);
}
