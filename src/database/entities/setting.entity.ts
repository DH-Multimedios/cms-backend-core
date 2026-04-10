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
 * Tipo del dato almacenado en `value`.
 * El servicio usa este campo para parsear/validar el valor.
 */
export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'password';

/**
 * Cómo renderiza el dashboard el campo.
 * El frontend usa este campo para elegir el componente de formulario.
 */
export type SettingInputType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'password'
  | 'toggle'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'color'
  | 'url'
  | 'email'
  | 'date';

/**
 * Metadata extra según el inputType.
 * - select / radio / checkbox → { options: [{value, label}] }
 * - textarea                  → { rows?: number }
 * - number                    → { min?: number, max?: number }
 * - resto                     → null
 */
export interface SettingMeta {
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  min?: number;
  max?: number;
}

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

  @Column({ default: 'text' })
  inputType: SettingInputType;

  @Column({ type: 'jsonb', nullable: true })
  meta: SettingMeta | null;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
