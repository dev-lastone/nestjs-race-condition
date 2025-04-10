import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DbLockService } from './db-lock.service';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: DbLockService) {}

  @Post(':couponId/issue/:userId')
  async issueCoupon(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const result = await this.couponService.issueCoupon(userId, couponId);
    return { message: result };
  }
}
