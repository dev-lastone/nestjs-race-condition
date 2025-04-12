import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { RedisLuaService } from './redis-lua.service';
import { DbLockModule } from './db-lock/db-lock.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [DbLockModule, QueueModule],
  controllers: [CouponController],
  providers: [RedisLuaService],
})
export class CouponModule {}
