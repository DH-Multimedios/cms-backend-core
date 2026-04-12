import { DataSource } from 'typeorm';
import { EmailLayout } from '../entities/email-layout.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { NotificationType } from '../entities/notification-type.entity';
import { Section } from '../entities/notification-block.types';

// ─── Layouts ────────────────────────────────────────────────────────────────

const DEFAULT_HEADER: Section[] = [
  {
    type: 'section',
    backgroundColor: '#1a1a2e',
    padding: '20px 40px',
    columns: [
      {
        width: '50%',
        verticalAlign: 'middle',
        blocks: [
          {
            type: 'image',
            src: '{{appLogoUrl}}',
            alt: '{{appName}}',
            width: '140px',
            align: 'left',
          },
        ],
      },
      {
        width: '50%',
        verticalAlign: 'middle',
        blocks: [
          {
            type: 'text',
            content: '{{appName}}',
            color: '#ffffff',
            fontSize: '14px',
            align: 'right',
          },
        ],
      },
    ],
  },
];

const DEFAULT_FOOTER: Section[] = [
  {
    type: 'section',
    backgroundColor: '#f5f5f5',
    padding: '20px 40px',
    columns: [
      {
        width: '100%',
        blocks: [
          {
            type: 'text',
            content: '© {{currentYear}} {{appName}}. Todos los derechos reservados.<br>{{appUrl}}',
            color: '#999999',
            fontSize: '12px',
            align: 'center',
          },
        ],
      },
    ],
  },
];

// ─── Notification types ─────────────────────────────────────────────────────

const NOTIFICATION_TYPES = [
  {
    key: 'user.welcome',
    entityType: 'user',
    notificationType: 'welcome',
    name: 'Email de bienvenida',
    description: 'Se envía al crear un usuario nuevo',
    userConfigurable: false,
    defaultEnabled: true,
  },
  {
    key: 'user.password-reset',
    entityType: 'user',
    notificationType: 'password-reset',
    name: 'Recuperación de contraseña',
    description: 'Se envía al solicitar un reset de contraseña',
    userConfigurable: false,
    defaultEnabled: true,
  },
  {
    key: 'user.email-verification',
    entityType: 'user',
    notificationType: 'email-verification',
    name: 'Verificación de email',
    description: 'Se envía al solicitar verificación de email',
    userConfigurable: true,
    defaultEnabled: true,
  },
  {
    key: 'user.forgot-password-code',
    entityType: 'user',
    notificationType: 'forgot-password-code',
    name: 'Código de recuperación de contraseña',
    description: 'Se envía al solicitar recuperación de contraseña con código numérico',
    userConfigurable: false,
    defaultEnabled: true,
  },
];

// ─── Email templates (body sections) ────────────────────────────────────────

const WELCOME_BODY: Section[] = [
  {
    type: 'section',
    backgroundColor: '#ffffff',
    padding: '40px 40px 20px',
    columns: [
      {
        width: '100%',
        blocks: [
          {
            type: 'heading',
            level: 1,
            content: 'Bienvenido, {{firstName}}',
            color: '#1a1a2e',
            align: 'left',
          },
          {
            type: 'text',
            content: 'Tu cuenta fue creada exitosamente. Ya podés acceder a la plataforma.',
            color: '#444444',
            fontSize: '16px',
          },
          { type: 'spacer', height: 20 },
          {
            type: 'button',
            label: 'Verificar mi email',
            url: '{{appUrl}}/verify?token={{verificationToken}}',
            backgroundColor: '#1a1a2e',
            color: '#ffffff',
            align: 'center',
          },
        ],
      },
    ],
  },
];

const PASSWORD_RESET_BODY: Section[] = [
  {
    type: 'section',
    backgroundColor: '#ffffff',
    padding: '40px 40px 20px',
    columns: [
      {
        width: '100%',
        blocks: [
          {
            type: 'heading',
            level: 1,
            content: 'Recuperar contraseña',
            color: '#1a1a2e',
            align: 'left',
          },
          {
            type: 'text',
            content: 'Hola {{firstName}}, recibimos una solicitud para restablecer tu contraseña.',
            color: '#444444',
            fontSize: '16px',
          },
          {
            type: 'text',
            content: 'Si no fuiste vos, ignorá este email. El enlace expira en 1 hora.',
            color: '#888888',
            fontSize: '14px',
          },
          { type: 'spacer', height: 20 },
          {
            type: 'button',
            label: 'Restablecer contraseña',
            url: '{{appUrl}}/reset-password?token={{resetToken}}',
            backgroundColor: '#e74c3c',
            color: '#ffffff',
            align: 'center',
          },
        ],
      },
    ],
  },
];

const EMAIL_VERIFICATION_BODY: Section[] = [
  {
    type: 'section',
    backgroundColor: '#ffffff',
    padding: '40px 40px 20px',
    columns: [
      {
        width: '100%',
        blocks: [
          {
            type: 'heading',
            level: 1,
            content: 'Verificá tu email',
            color: '#1a1a2e',
            align: 'left',
          },
          {
            type: 'text',
            content:
              'Hola {{firstName}}, hacé clic en el botón para verificar tu dirección de email.',
            color: '#444444',
            fontSize: '16px',
          },
          { type: 'spacer', height: 20 },
          {
            type: 'button',
            label: 'Verificar email',
            url: '{{appUrl}}/verify?token={{verificationToken}}',
            backgroundColor: '#27ae60',
            color: '#ffffff',
            align: 'center',
          },
        ],
      },
    ],
  },
];

const FORGOT_PASSWORD_CODE_BODY: Section[] = [
  {
    type: 'section',
    backgroundColor: '#ffffff',
    padding: '40px 40px 20px',
    columns: [
      {
        width: '100%',
        blocks: [
          {
            type: 'heading',
            level: 1,
            content: 'Recuperar contraseña',
            color: '#1a1a2e',
            align: 'left',
          },
          {
            type: 'text',
            content: 'Usá este código para restablecer tu contraseña. Válido por 15 minutos.',
            color: '#444444',
            fontSize: '16px',
          },
          { type: 'spacer', height: 20 },
          {
            type: 'text',
            content:
              '<span style="letter-spacing: 12px; font-size: 40px; font-weight: bold; color: #1a1a2e;">{{code}}</span>',
            align: 'center',
          },
          { type: 'spacer', height: 20 },
          {
            type: 'text',
            content: 'Si no solicitaste este código, ignorá este email.',
            color: '#888888',
            fontSize: '14px',
          },
        ],
      },
    ],
  },
];

const EMAIL_TEMPLATES = [
  {
    entityType: 'user',
    notificationType: 'welcome',
    name: 'Bienvenida',
    subject: 'Bienvenido a {{appName}}, {{firstName}}',
    bodySections: WELCOME_BODY,
    variables: ['firstName', 'verificationToken', 'appName', 'appLogoUrl', 'appUrl', 'currentYear'],
    isDefault: true,
  },
  {
    entityType: 'user',
    notificationType: 'password-reset',
    name: 'Recuperación de contraseña',
    subject: 'Restablecé tu contraseña en {{appName}}',
    bodySections: PASSWORD_RESET_BODY,
    variables: ['firstName', 'resetToken', 'appName', 'appLogoUrl', 'appUrl', 'currentYear'],
    isDefault: true,
  },
  {
    entityType: 'user',
    notificationType: 'email-verification',
    name: 'Verificación de email',
    subject: 'Verificá tu email en {{appName}}',
    bodySections: EMAIL_VERIFICATION_BODY,
    variables: ['firstName', 'verificationToken', 'appName', 'appLogoUrl', 'appUrl', 'currentYear'],
    isDefault: true,
  },
  {
    entityType: 'user',
    notificationType: 'forgot-password-code',
    name: 'Código de recuperación de contraseña',
    subject: 'Tu código de recuperación en {{appName}}',
    bodySections: FORGOT_PASSWORD_CODE_BODY,
    variables: ['code', 'appName', 'appLogoUrl', 'appUrl', 'currentYear'],
    isDefault: true,
  },
];

// ─── Seeder ─────────────────────────────────────────────────────────────────

export async function seedNotifications(dataSource: DataSource): Promise<void> {
  const layoutRepo = dataSource.getRepository(EmailLayout);
  const templateRepo = dataSource.getRepository(EmailTemplate);
  const notifTypeRepo = dataSource.getRepository(NotificationType);

  // Header default
  let header = await layoutRepo.findOneBy({ type: 'header', isDefault: true });
  if (!header) {
    header = await layoutRepo.save(
      layoutRepo.create({
        type: 'header',
        name: 'Header por defecto',
        sections: DEFAULT_HEADER,
        isDefault: true,
      }),
    );
    console.log('  ✓ Header por defecto creado');
  } else {
    console.log('  – Header por defecto existente');
  }

  // Footer default
  let footer = await layoutRepo.findOneBy({ type: 'footer', isDefault: true });
  if (!footer) {
    footer = await layoutRepo.save(
      layoutRepo.create({
        type: 'footer',
        name: 'Footer por defecto',
        sections: DEFAULT_FOOTER,
        isDefault: true,
      }),
    );
    console.log('  ✓ Footer por defecto creado');
  } else {
    console.log('  – Footer por defecto existente');
  }

  // Notification types
  for (const def of NOTIFICATION_TYPES) {
    const existing = await notifTypeRepo.findOneBy({ key: def.key });
    if (!existing) {
      await notifTypeRepo.save(notifTypeRepo.create(def));
      console.log(`  ✓ Tipo creado: ${def.key}`);
    } else {
      console.log(`  – Tipo existente: ${def.key}`);
    }
  }

  // Email templates (sin compilar — compiledHtml se genera cuando hay un renderer disponible)
  for (const def of EMAIL_TEMPLATES) {
    const existing = await templateRepo.findOneBy({
      entityType: def.entityType,
      notificationType: def.notificationType,
    });
    if (!existing) {
      await templateRepo.save(
        templateRepo.create({
          ...def,
          headerId: header.id,
          footerId: footer.id,
          compiledHtml: null,
        }),
      );
      console.log(`  ✓ Template creado: ${def.entityType}.${def.notificationType}`);
    } else {
      console.log(`  – Template existente: ${def.entityType}.${def.notificationType}`);
    }
  }
}
