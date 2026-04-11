import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Section } from './notification-block.types';

export type EmailLayoutType = 'header' | 'footer';

@Entity('email_layouts')
export class EmailLayout {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  type: EmailLayoutType;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  sections: Section[];

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
