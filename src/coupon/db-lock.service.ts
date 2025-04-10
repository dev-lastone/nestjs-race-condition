import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DbLockService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async issueCoupon(userId: number, couponId: number): Promise<string> {
    return await this.dataSource.transaction(async (manager) => {
      // 쿠폰 row를 락 걸고 가져옴
      const coupon = await manager.query(
        `SELECT * FROM coupon WHERE id = ? FOR UPDATE`,
        [couponId],
      );

      if (!coupon.length) {
        throw new Error('쿠폰이 존재하지 않음');
      }

      const { remaining_count } = coupon[0];

      if (remaining_count <= 0) {
        throw new Error('쿠폰 소진됨');
      }

      // 중복 발급 확인
      const existing = await manager.query(
        `SELECT * FROM user_coupon WHERE user_id = ? AND coupon_id = ?`,
        [userId, couponId],
      );

      if (existing.length > 0) {
        throw new Error('이미 발급받은 쿠폰입니다');
      }

      // 수량 차감 및 발급 기록
      await manager.query(
        `UPDATE coupon SET remaining_count = remaining_count - 1 WHERE id = ?`,
        [couponId],
      );

      await manager.query(
        `INSERT INTO user_coupon (user_id, coupon_id) VALUES (?, ?)`,
        [userId, couponId],
      );

      return '쿠폰 발급 완료';
    });
  }
}
