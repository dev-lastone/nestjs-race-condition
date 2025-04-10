import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { DbLockService } from './db-lock.service';

@Module({
  controllers: [CouponController],
  providers: [DbLockService],
})
export class CouponModule {}
