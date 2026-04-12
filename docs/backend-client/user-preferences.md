# User Preferences — Guía para proyectos cliente

El core provee preferencias de usuario para campos universales (`theme`). Para agregar preferencias propias del proyecto, extendé `BaseUserPreferencesService<T>` con tu propia entidad.

---

## Usar las preferencias del core

```typescript
import { UserPreferencesService } from '@dh/backend-core';

@Injectable()
export class ProfileService {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  async getProfile(userId: string) {
    const preferences = await this.userPreferencesService.findOrCreate(userId);
    return { ...profile, preferences };
  }
}
```

---

## Agregar preferencias propias del proyecto

### 1. Crear la entidad

```typescript
// src/database/entities/client-user-preference.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@dh/backend-core';

@Entity('client_user_preferences')
@Unique(['userId'])
export class ClientUserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Tus preferencias específicas del proyecto
  @Column({ default: 'table' })
  dashboardLayout: 'table' | 'grid';

  @Column({ default: true })
  emailNotifications: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 2. Crear la migración

```typescript
// src/database/migrations/{timestamp}-AddClientUserPreferences.ts
export class AddClientUserPreferences implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "client_user_preferences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "dashboardLayout" varchar(10) NOT NULL DEFAULT 'table',
        "emailNotifications" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_client_user_preferences_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_client_user_preferences" PRIMARY KEY ("id"),
        CONSTRAINT "FK_client_user_preferences_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "client_user_preferences"`);
  }
}
```

### 3. Crear el servicio extendiendo la base

```typescript
// src/modules/client-user-preferences/client-user-preferences.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUserPreferencesService } from '@dh/backend-core';
import { ClientUserPreference } from '../../database/entities/client-user-preference.entity';
import { UpdateClientUserPreferenceDto } from './dto/update-client-user-preference.dto';

@Injectable()
export class ClientUserPreferencesService extends BaseUserPreferencesService<ClientUserPreference> {
  constructor(
    @InjectRepository(ClientUserPreference)
    repository: Repository<ClientUserPreference>,
  ) {
    super(repository);
  }

  async updatePreferences(
    userId: string,
    dto: UpdateClientUserPreferenceDto,
  ): Promise<ClientUserPreference> {
    return this.update(userId, dto);
  }
}
```

`findOrCreate` y `update` ya están implementados en la clase base — no hace falta reescribirlos.

### 4. Crear el módulo

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([ClientUserPreference])],
  controllers: [ClientUserPreferencesController],
  providers: [ClientUserPreferencesService],
  exports: [ClientUserPreferencesService],
})
export class ClientUserPreferencesModule {}
```

---

## Combinar preferencias del core + propias

Si tu endpoint de perfil necesita devolver todo junto:

```typescript
async getFullPreferences(userId: string) {
  const [corePrefs, clientPrefs] = await Promise.all([
    this.userPreferencesService.findOrCreate(userId),
    this.clientUserPreferencesService.findOrCreate(userId),
  ]);

  return { ...corePrefs, ...clientPrefs };
}
```

---

## API de BaseUserPreferencesService\<T\>

| Método                            | Descripción                                          |
| --------------------------------- | ---------------------------------------------------- |
| `findOrCreate(userId, defaults?)` | Retorna las prefs existentes o las crea con defaults |
| `update(userId, dto)`             | Upsert — crea si no existen, actualiza si existen    |
