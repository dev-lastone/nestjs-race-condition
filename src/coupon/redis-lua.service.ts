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
    try {
      const luaScript = `
    local countKey = KEYS[1]
    local userKey = KEYS[2]

    -- 이미 발급한 사용자면 실패
    if redis.call("EXISTS", userKey) == 1 then
      return -2
    end

    -- 수량 부족
    local count = tonumber(redis.call("GET", countKey))
    if count <= 0 then
      return -1
    end
    
    redis.call("decr", countKey)
    redis.call("SET", userKey, 1)
    redis.call("EXPIRE", userKey, 60) -- 1분간 중복 방지
    
    return count - 1
  `;

      const redisCountKey = `coupon:${couponId}:count`;
      const redisUserKey = `coupon:${couponId}:user:${userId}`;
      const result = await this.redisClient.eval(
        luaScript,
        2,
        redisCountKey,
        redisUserKey,
      );

      if (result === -1) {
        throw new Error('쿠폰 소진됨');
      }

      if (result === -2) {
        throw new Error('이미 발급받은 쿠폰입니다');
      }

      // 중복 발급 확인 (DB 기준)
      const existing = await this.dataSource.query(
        `SELECT * FROM user_coupon WHERE user_id = ? AND coupon_id = ?`,
        [userId, couponId],
      );

      if (existing.length > 0) {
        // Redis 수량 복구 (optional)
        await this.redisClient.incr(redisCountKey);
        throw new Error('이미 발급받은 쿠폰입니다');
      }

      // 발급 기록 저장
      await this.dataSource.query(
        `INSERT INTO user_coupon (user_id, coupon_id) VALUES (?, ?)`,
        [userId, couponId],
      );
    } catch (e) {
      return e.message;
    }
  }
}
