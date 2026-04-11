import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Taxonomy } from './taxonomy.entity';

@Entity('entity_taxonomies')
@Unique(['entityType', 'entityId', 'taxonomyId'])
export class EntityTaxonomy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Tipo de la entidad que referencia esta taxonomía.
   * Convenio: PascalCase del nombre de la entidad — e.g. 'Product', 'Post', 'Order'
   */
  @Column()
  entityType: string;

  @Column({ type: 'uuid' })
  entityId: string;

  @Column({ type: 'uuid' })
  taxonomyId: string;

  @ManyToOne(() => Taxonomy, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taxonomyId' })
  taxonomy: Taxonomy;

  @CreateDateColumn()
  createdAt: Date;
}
