import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SettingCategory } from './setting-category.entity';

/**
 * Tipos de valor soportados.
 * El servicio usa `type` para parsear/validar el valor almacenado como text.
 */
export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'password';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  categoryId: number;

  @ManyToOne(() => SettingCategory, (cat) => cat.settings, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: SettingCategory;

  @Column({ unique: true })
  key: string;

  @Column()
  label: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'string' })
  type: SettingType;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
