import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DbLockService } from './db-lock.service';
import { RedisLuaService } from './redis-lua.service';

@Controller('coupons')
export class CouponController {
  constructor(
    private readonly dbLockService: DbLockService,
    private readonly redisLuaService: RedisLuaService,
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
}
