import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Session ID almacenado como hash SHA-256 del valor real.
   * El valor plano viaja en cookie HttpOnly (web) o header X-Session-Id (Flutter).
   * Nunca se almacena en texto plano.
   */
  @Column({ unique: true })
  token: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  expiresAt: Date;

  /**
   * Si está seteado, la sesión fue revocada (logout).
   * NULL = sesión activa.
   */
  @Column({ nullable: true })
  revokedAt: Date;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ip: string;

  @CreateDateColumn()
  createdAt: Date;
}
