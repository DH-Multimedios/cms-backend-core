import { Repository } from 'typeorm';

/**
 * Servicio base genérico para preferencias de usuario.
 *
 * Uso en proyectos cliente:
 *
 * ```typescript
 * @Injectable()
 * export class MyUserPreferencesService extends BaseUserPreferencesService<MyUserPreference> {
 *   constructor(
 *     @InjectRepository(MyUserPreference)
 *     repository: Repository<MyUserPreference>,
 *   ) {
 *     super(repository);
 *   }
 * }
 * ```
 */
export abstract class BaseUserPreferencesService<T extends { userId: string }> {
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * Busca las preferencias del usuario; si no existen, las crea con los defaults
   * provistos (o vacío si no se pasan).
   */
  async findOrCreate(userId: string, defaults: Partial<Omit<T, 'userId'>> = {}): Promise<T> {
    let preference = await this.repository.findOneBy({ userId } as any);

    if (!preference) {
      preference = this.repository.create({ userId, ...defaults } as any);
      await this.repository.save(preference);
    }

    return preference;
  }

  /**
   * Actualiza (upsert) las preferencias del usuario.
   */
  async update(userId: string, dto: Partial<Omit<T, 'userId'>>): Promise<T> {
    let preference = await this.repository.findOneBy({ userId } as any);

    if (!preference) {
      preference = this.repository.create({ userId } as any);
    }

    Object.assign(preference, dto);

    return this.repository.save(preference);
  }
}
