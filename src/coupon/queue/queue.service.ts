import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('coupon-issue') private readonly couponQueue: Queue,
  ) {}

  async issueCoupon(userId: number, couponId: number) {
    // redis coupon:couponId:user:userId 검증
    // redis 선착순 필터
    // 서버 시간제한

    await this.couponQueue.add('issue', {
      userId,
      couponId,
    });
  }
}
