import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { DbLockService } from './db-lock.service';
import { RedisLuaService } from './redis-lua.service';

@Module({
  controllers: [CouponController],
  providers: [DbLockService, RedisLuaService],
})
export class CouponModule {}
