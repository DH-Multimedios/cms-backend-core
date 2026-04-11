# Notificaciones — Guía para proyectos cliente

Cómo emitir eventos de notificación, registrar tipos nuevos y extender el sistema desde un proyecto cliente.

---

## Cómo funciona

El core escucha eventos de dominio vía `EventEmitter`. Cuando un módulo emite un evento, el `NotificationsService` verifica si hay un template activo y lo envía por el provider de email activo.

```
Módulo cliente emite evento → NotificationsService escucha → verifica tipo + preferencia → renderiza + envía
```

---

## Emitir eventos del core

Los eventos de user ya están implementados en el core. Para dispararlos desde tu módulo, inyectá `EventEmitter2` y emití la clase de evento correspondiente.

### Evento: usuario creado

```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '@dh/backend-core';

@Injectable()
export class MiServicio {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async crearUsuario(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const token = await this.generarTokenVerificacion(user);

    this.eventEmitter.emit('user.created', new UserCreatedEvent(user, token));

    return user;
  }
}
```

> Por defecto, `UsersService` del core ya emite `user.created` al crear usuarios. Solo necesitás hacerlo manualmente si tenés tu propio flujo de creación.

### Eventos disponibles del core

| Evento | Clase | Cuándo emitirlo |
|--------|-------|-----------------|
| `user.created` | `UserCreatedEvent(user, verificationToken)` | Al crear un usuario |
| `user.password-reset-requested` | `UserPasswordResetRequestedEvent(user, resetToken)` | Al solicitar reset de contraseña |
| `user.email-verification-requested` | `UserEmailVerificationRequestedEvent(user, verificationToken)` | Al solicitar reenvío de verificación |

---

## Registrar un tipo de notificación propio

Desde tu módulo, registrá el tipo al inicializar (`OnModuleInit`):

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationTypesService } from '@dh/backend-core';

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    private readonly notificationTypesService: NotificationTypesService,
  ) {}

  async onModuleInit() {
    // Registra el tipo solo si no existe
    const existing = await this.notificationTypesService.findByKey('order.created');
    if (!existing) {
      await this.notificationTypesService.create({
        key: 'order.created',
        entityType: 'order',
        notificationType: 'created',
        name: 'Pedido recibido',
        description: 'Se envía cuando el cliente realiza un pedido',
        userConfigurable: true,
        defaultEnabled: true,
      });
    }
  }
}
```

---

## Emitir una notificación propia

Una vez registrado el tipo, emitís tu evento de dominio y el sistema lo procesa:

```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';

// 1. Definí tu clase de evento en tu módulo
export class OrderCreatedEvent {
  constructor(
    public readonly order: Order,
    public readonly customer: User,
  ) {}
}

// 2. Emití el evento
this.eventEmitter.emit('order.created', new OrderCreatedEvent(order, customer));
```

### 3. Escuchá el evento en tu propio listener

Extendé el sistema creando un listener en tu módulo. El core no sabe de `order.created` — vos manejás el dispatch:

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationTypesService, NotificationPreferencesService, EmailTemplatesService, TemplateRendererService, EmailSenderService } from '@dh/backend-core';

@Injectable()
export class OrderNotificationsListener {
  constructor(
    private readonly notifTypesService: NotificationTypesService,
    private readonly preferencesService: NotificationPreferencesService,
    private readonly templatesService: EmailTemplatesService,
    private readonly renderer: TemplateRendererService,
    private readonly sender: EmailSenderService,
  ) {}

  @OnEvent('order.created', { async: true })
  async handleOrderCreated(event: OrderCreatedEvent) {
    const notifType = await this.notifTypesService.findByKey('order.created');
    if (!notifType?.isEnabled) return;

    const enabled = await this.preferencesService.isEnabled(event.customer.id, 'order.created');
    if (!enabled) return;

    const template = await this.templatesService.findByType('order', 'created');
    if (!template?.compiledHtml) return;

    const html = this.renderer.render(template.compiledHtml, {
      firstName: event.customer.firstName,
      orderNumber: event.order.number,
      orderUrl: `${process.env.APP_URL}/orders/${event.order.id}`,
    });

    const subject = this.renderer.render(template.subject, {
      orderNumber: event.order.number,
    });

    await this.sender.send({ to: event.customer.email, subject, html });
  }
}
```

Registrá el listener en tu módulo:

```typescript
@Module({
  providers: [OrderNotificationsListener],
})
export class OrdersModule {}
```

---

## Seed de templates propios

En el seeder de tu proyecto cliente, creá los templates que necesitás:

```typescript
import { DataSource } from 'typeorm';
import { EmailTemplate, EmailLayout } from '@dh/backend-core';

export async function seedOrderTemplates(dataSource: DataSource) {
  const templateRepo = dataSource.getRepository(EmailTemplate);
  const layoutRepo = dataSource.getRepository(EmailLayout);

  // Usar el header/footer por defecto del core
  const header = await layoutRepo.findOneBy({ type: 'header', isDefault: true });
  const footer = await layoutRepo.findOneBy({ type: 'footer', isDefault: true });

  const existing = await templateRepo.findOneBy({ entityType: 'order', notificationType: 'created' });
  if (existing) return;

  await templateRepo.save(templateRepo.create({
    entityType: 'order',
    notificationType: 'created',
    name: 'Pedido recibido',
    subject: 'Tu pedido #{{orderNumber}} fue recibido',
    headerId: header?.id ?? null,
    footerId: footer?.id ?? null,
    bodySections: [
      {
        type: 'section',
        backgroundColor: '#ffffff',
        padding: '40px',
        columns: [
          {
            width: '100%',
            blocks: [
              { type: 'heading', level: 1, content: 'Pedido recibido', color: '#1a1a2e' },
              { type: 'text', content: 'Hola {{firstName}}, recibimos tu pedido #{{orderNumber}}.' },
              { type: 'button', label: 'Ver mi pedido', url: '{{orderUrl}}', backgroundColor: '#1a1a2e' },
            ],
          },
        ],
      },
    ],
    variables: ['firstName', 'orderNumber', 'orderUrl'],
    isDefault: false,
    compiledHtml: null, // se compila la primera vez que se edita desde el admin
  }));
}
```

---

## Override del provider de email

El provider activo se gestiona desde la API. No necesitás código — desde el admin activás el provider que quieras:

```
POST /email-providers          → crear provider (SMTP, Resend, Google OAuth)
POST /email-providers/:id/activate  → activar (desactiva los demás)
```

Solo puede haber un provider activo a la vez.

---

## Variables globales automáticas

El `NotificationsService` del core inyecta automáticamente estas variables en todos los templates:

> ⚠️ Actualmente las variables globales (`appName`, `appUrl`, etc.) deben pasarse manualmente en el `data` del evento. En una próxima versión se inyectarán automáticamente desde Settings.

Para ya tenerlas disponibles, en tu listener incluí:

```typescript
const html = this.renderer.render(template.compiledHtml, {
  // variables específicas del evento
  firstName: event.customer.firstName,
  orderNumber: event.order.number,
  // variables globales
  appName: process.env.APP_NAME,
  appUrl: process.env.APP_URL,
  currentYear: new Date().getFullYear(),
});
```
