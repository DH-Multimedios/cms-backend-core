import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type EmailProviderType = 'smtp' | 'resend' | 'google-oauth';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
}

export interface ResendConfig {
  apiKey: string;
}

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  user: string;
}

export type EmailProviderConfig = SmtpConfig | ResendConfig | GoogleOAuthConfig;

@Entity('email_providers')
export class EmailProvider {
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre descriptivo definido por el admin (ej: "SMTP corporativo") */
  @Column()
  name: string;

  @Column()
  provider: EmailProviderType;

  /** Dirección remitente para este provider (overridea email.from de settings) */
  @Column({ nullable: true })
  from: string;

  /** Config específica del provider — shape varía según `provider` */
  @Column({ type: 'jsonb' })
  config: EmailProviderConfig;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
