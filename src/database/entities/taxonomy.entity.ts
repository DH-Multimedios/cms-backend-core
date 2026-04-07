import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('taxonomies')
export class Taxonomy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  /**
   * Tipo de taxonomía
   * Ejemplos: category, tag, status, etc.
   * Permite diferenciar taxonomías por propósito
   */
  @Column()
  type: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  /**
   * ID de la imagen asociada (nullable)
   * Relación con Media (NO cargada automáticamente)
   * La composición se hace en el controlador cuando se solicita
   */
  @Column({ type: 'uuid', nullable: true })
  imageId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
