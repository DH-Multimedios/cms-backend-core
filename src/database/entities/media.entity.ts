import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  alt: string;

  @Column()
  mimetype: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column()
  path: string;

  @Column()
  url: string;

  @Column({ type: 'uuid' })
  uploadedByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedByUserId' })
  uploadedBy: User;

  @Column()
  usage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
