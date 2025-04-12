import { Module } from '@nestjs/common';
import { DbLockService } from './db-lock.service';

@Module({
  providers: [DbLockService],
  exports: [DbLockService],
})
export class DbLockModule {}
