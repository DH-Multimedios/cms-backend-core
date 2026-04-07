import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Acción realizada
   * Ejemplos: login, create, update, delete
   */
  @Column()
  action: string;

  /**
   * Entidad afectada
   * Ejemplos: User, Role, Product
   */
  @Column()
  entity: string;

  /**
   * ID de la entidad afectada
   */
  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  /**
   * Metadata adicional (JSON)
   * Puede incluir: datos antes/después, IP, user agent, etc.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
