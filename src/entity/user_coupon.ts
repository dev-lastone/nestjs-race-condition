import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserCoupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('int', { name: 'coupon_id' })
  couponId: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date | null;
}
