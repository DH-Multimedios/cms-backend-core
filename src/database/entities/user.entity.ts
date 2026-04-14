import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  /**
   * Usuario del sistema (desarrollador/propietario)
   * - Solo puede haber UNO en toda la base de datos
   * - Bypasea todos los permisos
   * - Invisible para todos los usuarios
   * - Inmutable desde la API
   */
  @Column({ default: false })
  isSystemUser: boolean;

  /**
   * Usuario protegido del cliente
   * - No se puede eliminar (excepto por usuario del sistema)
   * - Protege contra borrados accidentales
   * - Inmutable después de creación
   */
  @Column({ default: false })
  isProtected: boolean;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  lastLoginAt: Date;
}
