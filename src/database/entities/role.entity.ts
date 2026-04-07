import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  /**
   * Peso del rol (solo para UI y jerarquía visual)
   * - NO se usa para bypass de permisos
   * - Se usa para ordenar roles en frontend
   * - Se usa para evitar que un Admin asigne un rol de mayor peso
   * - Ejemplos: SuperAdmin=100, Admin=90, Manager=50, User=10
   */
  @Column({ type: 'int', default: 0 })
  weight: number;

  /**
   * Rol protegido
   * - No se puede eliminar (excepto por usuario del sistema)
   * - Protege roles críticos (SuperAdmin, Admin)
   */
  @Column({ default: false })
  isProtected: boolean;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
