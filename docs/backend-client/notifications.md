# Notificaciones — Guía para proyectos cliente

El core registra listeners **solo para sus eventos de usuario**. Registrar el tipo `order.created` o emitir un evento propio no instala un listener: el cliente debe registrar el suyo y elegir cómo despachar. Para usar templates del core sin depender de servicios internos, creá el tipo y el template con la API administrativa y llamá a `NotificationsService.notifySystem()` desde ese listener. **`notifySystem()` no consulta preferencias del destinatario**; si necesitás respetarlas para un evento propio, implementá esa comprobación en el cliente antes de llamar o acordá una ampliación del core.

## Eventos del core

`UsersService` ya emite `user.created` en su flujo de creación; no vuelvas a emitirlo después de llamar a ese servicio o duplicarías el envío. El core también maneja `user.password-reset-requested` y `user.email-verification-requested`. Solo `UserCreatedEvent` está exportado desde `@dh/backend-core`; los otros eventos se usan internamente.

Los listeners del core verifican tipo y preferencias, resuelven el template y envían mediante el provider activo. **Ese comportamiento no se aplica automáticamente a los eventos del cliente.**

## Preparar el tipo y el template propios

Con una sesión administradora autorizada con `notifications.manage`, comprobá si el tipo/template ya existen antes de crearlos; la creación no es idempotente. `POST /notification-types` recibe:

```json
{
  "key": "order.created",
  "entityType": "order",
  "notificationType": "created",
  "name": "Pedido recibido",
  "description": "Se envía cuando el cliente realiza un pedido",
  "userConfigurable": false,
  "defaultEnabled": true
}
```

`GET /notification-types` lista los tipos. `userConfigurable: false` evita prometer un opt-out que `notifySystem()` no implementa. También podés desactivar el tipo globalmente con `isEnabled` desde la administración.

Creá un template para `order`/`created` con `POST /email-templates` (también requiere `notifications.manage`); la API lo compila al guardarlo:

```json
{
  "entityType": "order",
  "notificationType": "created",
  "name": "Pedido recibido",
  "subject": "Tu pedido #{{orderNumber}} fue recibido",
  "bodySections": [
    {
      "type": "section",
      "backgroundColor": "#ffffff",
      "padding": "40px",
      "columns": [
        {
          "width": "100%",
          "blocks": [
            { "type": "heading", "level": 1, "content": "Pedido recibido", "color": "#1a1a2e" },
            { "type": "text", "content": "Hola {{firstName}}, recibimos tu pedido #{{orderNumber}}." }
          ]
        }
      ]
    }
  ],
  "variables": ["firstName", "orderNumber"]
}
```

`GET /email-templates` devuelve una página (`items`, `total`, `page`, `limit`, `pages`), no un array. No importes `EmailTemplate`, `EmailLayout` o `NotificationTypesService` desde el barrel de `@dh/backend-core`: no están exportados por `src/index.ts`.

## Emitir y escuchar el evento propio

Emití `order.created` desde tu servicio de pedidos después de confirmar la operación. Ejemplo de payload, definido por el cliente:

```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface OrderCreatedEvent {
  customerEmail: string;
  firstName: string;
  orderNumber: string;
}

// En el servicio de pedidos, luego de guardar el pedido:
const event: OrderCreatedEvent = {
  customerEmail: customer.email,
  firstName: customer.firstName,
  orderNumber: order.number,
};
this.eventEmitter.emit('order.created', event);
```

Registrá **también** un listener como provider de `OrdersModule`, e importá `NotificationsModule` para inyectar el servicio publicado:

```typescript
import { Injectable, Module } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsModule, NotificationsService } from '@dh/backend-core';
import { OrderCreatedEvent } from './order-created.event';

@Injectable()
export class OrderNotificationsListener {
  constructor(private readonly notifications: NotificationsService) {}

  @OnEvent('order.created', { async: true })
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.notifications.notifySystem('order.created', event.customerEmail, {
      firstName: event.firstName,
      orderNumber: event.orderNumber,
    });
  }
}

@Module({
  imports: [NotificationsModule],
  providers: [OrderNotificationsListener],
})
export class OrdersModule {}
```

`notifySystem()` comprueba `isEnabled`, resuelve el template, mezcla variables globales y registra los errores de envío sin propagarlos al llamador. **No verifica preferencias del usuario**. Para un correo transaccional sin tipo/template, `NotificationsService.sendEmail({ to, subject, html })` envía directamente y tampoco consulta preferencias ni renderiza templates. No interpolés HTML de entrada no confiable manualmente.

## Provider y variables globales

Solo puede haber un provider de email activo. La API administrativa permite `POST /email-providers` y `POST /email-providers/:id/activate`; configurá uno antes de probar el envío.

`notifySystem()` (y los listeners de usuario del core) agregan `{{appName}}` desde `app.name`, `{{appUrl}}` desde `app.url`, `{{appLogoUrl}}` desde **`app.logo`** y `{{currentYear}}` al renderizar. Las variables específicas que le pasás tienen prioridad. `sendEmail()` **no** agrega estas variables. Por ejemplo, un botón del template puede usar `{{appUrl}}/orders/{{orderId}}` si el listener proporciona `orderId`.
