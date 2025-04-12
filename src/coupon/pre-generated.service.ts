import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PreGeneratedService {
  private readonly redisClient: Redis;

  constructor(
    private readonly redisService: RedisService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.redisClient = this.redisService.getOrThrow();
  }

  async generateCouponTokens(couponId: number, count: number) {
    const tokens: string[] = [];

    for (let i = 0; i < count; i++) {
      const token = uuidv4();
      const redisKey = `coupon:${couponId}:token:${token}`;

      // Redis에 저장 (예: 30분 TTL 설정)
      await this.redisClient.set(redisKey, 'available', 'EX', 1800);
      tokens.push(token);
    }

    return tokens;
  }

  async issueCoupon(userId: number, couponId: number, token: string) {
    try {
      const redisKey = `coupon:${couponId}:token:${token}`;

      const status = await this.redisClient.get(redisKey);
      if (status !== 'available') {
        throw new Error('유효하지 않거나 이미 사용된 토큰입니다.');
      }

      // Redis에서 즉시 사용 처리 (원자적으로 처리)
      const isSuccess = await this.redisClient.del(redisKey);
      if (!isSuccess) {
        throw new Error('토큰 사용 실패');
      }

      // DB에 쿠폰 발급 기록
      await this.dataSource.query(
        `INSERT INTO user_coupon (user_id, coupon_id) VALUES (?, ?)`,
        [userId, couponId],
      );
    } catch (e) {
      return e.message;
    }
  }
}
