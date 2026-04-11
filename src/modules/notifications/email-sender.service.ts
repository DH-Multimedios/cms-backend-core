import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { EmailProvidersService } from '../email-providers/email-providers.service';
import { SmtpConfig, GoogleOAuthConfig, ResendConfig } from '../../database/entities/email-provider.entity';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);

  constructor(private readonly emailProvidersService: EmailProvidersService) {}

  async send(options: SendEmailOptions): Promise<void> {
    const provider = await this.emailProvidersService.findActive();

    if (!provider) {
      this.logger.warn(`No hay provider de email activo. Email a ${options.to} no enviado.`);
      return;
    }

    const from = provider.from ?? options.to;

    switch (provider.provider) {
      case 'smtp': {
        const cfg = provider.config as SmtpConfig;
        const transport = nodemailer.createTransport({
          host: cfg.host,
          port: cfg.port,
          secure: cfg.secure,
          auth: { user: cfg.user, pass: cfg.pass },
        });
        await transport.sendMail({ from, to: options.to, subject: options.subject, html: options.html });
        break;
      }

      case 'resend': {
        const cfg = provider.config as ResendConfig;
        const resend = new Resend(cfg.apiKey);
        await resend.emails.send({ from, to: options.to, subject: options.subject, html: options.html });
        break;
      }

      case 'google-oauth': {
        const cfg = provider.config as GoogleOAuthConfig;
        const transport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: cfg.user,
            clientId: cfg.clientId,
            clientSecret: cfg.clientSecret,
            refreshToken: cfg.refreshToken,
          },
        });
        await transport.sendMail({ from, to: options.to, subject: options.subject, html: options.html });
        break;
      }
    }

    this.logger.log(`Email enviado a ${options.to} via ${provider.provider}`);
  }
}
