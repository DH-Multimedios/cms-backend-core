import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notification_types')
export class NotificationType {
  @PrimaryGeneratedColumn()
  id: number;

  /** Clave única del tipo. Formato: 'entityType.notificationType' — ej: 'user.welcome' */
  @Column({ unique: true })
  key: string;

  @Column()
  entityType: string;

  @Column()
  notificationType: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  /** Si true, el usuario puede optar por no recibirla desde su perfil */
  @Column({ default: true })
  userConfigurable: boolean;

  /** Valor por defecto para usuarios nuevos (sin preferencia explícita) */
  @Column({ default: true })
  defaultEnabled: boolean;

  /** Toggle global — admin puede desactivar sin borrar */
  @Column({ default: true })
  isEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
