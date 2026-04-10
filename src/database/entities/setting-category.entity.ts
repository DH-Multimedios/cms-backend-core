import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Setting } from './setting.entity';

@Entity('setting_categories')
export class SettingCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  label: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => Setting, (setting) => setting.category)
  settings: Setting[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
