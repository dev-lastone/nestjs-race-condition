import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DbLockService } from '../db-lock/db-lock.service';

@Processor('coupon-issue')
export class QueueProcessor extends WorkerHost {
  constructor(private readonly dbLockService: DbLockService) {
    super();
  }

  async process(job: Job<{ userId: number; couponId: number }>) {
    const { userId, couponId } = job.data;

    await this.dbLockService.issueCoupon(userId, couponId);
  }
}
