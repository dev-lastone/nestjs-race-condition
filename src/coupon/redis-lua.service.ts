import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisLuaService {
  private readonly redisClient: Redis;

  constructor(
    private readonly redisService: RedisService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.redisClient = this.redisService.getOrThrow();
  }

  async issueCoupon(userId: number, couponId: number): Promise<string> {
    const redisKey = `coupon:${couponId}:count`;

    const luaScript = `
    local key = KEYS[1]
    local count = tonumber(redis.call("get", key))
    if count <= 0 then
      return -1
    end
    redis.call("decr", key)
    return count - 1
  `;
    const result = await this.redisClient.eval(luaScript, 1, redisKey);

    if (result === -1) {
      throw new Error('쿠폰 소진됨');
    }

    // 중복 발급 확인 (DB 기준)
    const existing = await this.dataSource.query(
      `SELECT * FROM user_coupon WHERE user_id = ? AND coupon_id = ?`,
      [userId, couponId],
    );

    if (existing.length > 0) {
      // Redis 수량 복구 (optional)
      await this.redisClient.incr(redisKey);
      throw new Error('이미 발급받은 쿠폰입니다');
    }

    // 발급 기록 저장
    await this.dataSource.query(
      `INSERT INTO user_coupon (user_id, coupon_id) VALUES (?, ?)`,
      [userId, couponId],
    );

    return '쿠폰 발급 완료';
  }
}
