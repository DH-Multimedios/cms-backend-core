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

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;

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
  entityId: string | null;

  /**
   * Metadata adicional (JSON)
   * Puede incluir: datos antes/después, IP, user agent, etc.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'varchar', nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
