import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nombre del permiso
   * Formato: {module}.{action}
   * Ejemplos: users.read, users.create, products.update
   */
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  /**
   * Módulo al que pertenece el permiso
   * Ejemplos: users, roles, products, posts
   * Permite agrupar permisos por módulo
   */
  @Column()
  module: string;

  /**
   * Nombre legible del módulo para mostrar en UI
   * Ejemplos: Usuarios, Roles, Archivos
   */
  @Column({ nullable: true })
  moduleName: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
