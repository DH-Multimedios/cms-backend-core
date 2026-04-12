import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  codeHash: string; // SHA-256 del código de 6 dígitos

  @Column({ type: 'varchar', nullable: true })
  resetTokenHash: string | null; // SHA-256 del token de reset (se setea al verificar el código)

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
