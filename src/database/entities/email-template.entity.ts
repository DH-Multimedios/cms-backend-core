import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { EmailLayout } from './email-layout.entity';
import { Section } from './notification-block.types';

@Entity('email_templates')
@Unique(['entityType', 'notificationType'])
export class EmailTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityType: string;

  @Column()
  notificationType: string;

  @Column()
  name: string;

  /** Soporta variables Handlebars: 'Bienvenido {{firstName}}' */
  @Column()
  subject: string;

  @Column({ nullable: true })
  headerId: number | null;

  @ManyToOne(() => EmailLayout, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'headerId' })
  header: EmailLayout | null;

  @Column({ nullable: true })
  footerId: number | null;

  @ManyToOne(() => EmailLayout, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'footerId' })
  footer: EmailLayout | null;

  @Column({ type: 'jsonb' })
  bodySections: Section[];

  /** Variables disponibles en este template — documentación para el editor del front */
  @Column({ type: 'jsonb', default: [] })
  variables: string[];

  /** HTML compilado (MJML → HTML). Se regenera al guardar el template. */
  @Column({ type: 'text', nullable: true })
  compiledHtml: string | null;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
