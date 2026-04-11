import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
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
   * Vocabulario/tipo de la taxonomía — libre, definido por el cliente.
   * Ejemplos: 'category', 'tag', 'status', 'region', etc.
   */
  @Column()
  type: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  /**
   * ID de imagen asociada (nullable).
   * NO se carga automáticamente — composición en el controlador con ?includeImage=true.
   */
  @Column({ type: 'uuid', nullable: true })
  imageId: string;

  /**
   * Jerarquía opcional. null = nodo raíz.
   */
  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Taxonomy, (t) => t.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent: Taxonomy;

  @OneToMany(() => Taxonomy, (t) => t.parent)
  children: Taxonomy[];

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
