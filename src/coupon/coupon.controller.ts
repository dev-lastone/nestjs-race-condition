import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DbLockService } from './db-lock/db-lock.service';
import { RedisLuaService } from './redis-lua.service';
import { QueueService } from './queue/queue.service';
import { PreGeneratedService } from './pre-generated.service';

@Controller('coupons')
export class CouponController {
  constructor(
    private readonly dbLockService: DbLockService,
    private readonly redisLuaService: RedisLuaService,
    private readonly queueService: QueueService,
    private readonly preGeneratedService: PreGeneratedService,
  ) {}

  @Post(':couponId/issue/:userId/db-lock')
  async issueCouponDbLock(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.dbLockService.issueCoupon(userId, couponId);
  }

  @Post(':couponId/issue/:userId/redis-lua')
  async issueCouponRedisLua(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.redisLuaService.issueCoupon(userId, couponId);
  }

  @Post(':couponId/issue/:userId/queue')
  async issueCouponQueue(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.queueService.issueCoupon(userId, couponId);
  }

  @Post(':couponId/generate/:count')
  async generateCouponTokens(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Param('count', ParseIntPipe) count: number,
  ) {
    return await this.preGeneratedService.generateCouponTokens(couponId, count);
  }

  @Post(':couponId/issue/:userId/pre-generated/:token')
  async issueCouponPreGenerated(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('token') token: string,
  ) {
    return await this.preGeneratedService.issueCoupon(userId, couponId, token);
  }
}
