import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponModule } from './coupon/coupon.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'race-condition',
      entities: [__dirname + '/entity/*.js'],
      synchronize: true,
      logging: true,
    }),
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
        db: 0,
      },
    }),
    CouponModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
