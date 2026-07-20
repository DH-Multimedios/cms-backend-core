import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

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
    const existing = await this.repository.findOneBy({ userId } as FindOptionsWhere<T>);
    if (existing) return existing;

    const created = this.repository.create({ userId, ...defaults } as DeepPartial<T>);
    return this.repository.save(created);
  }

  /**
   * Actualiza (upsert) las preferencias del usuario.
   */
  async update(userId: string, dto: Partial<Omit<T, 'userId'>>): Promise<T> {
    const existing = await this.repository.findOneBy({ userId } as FindOptionsWhere<T>);
    const preference = existing ?? this.repository.create({ userId } as DeepPartial<T>);
    Object.assign(preference, dto);
    return this.repository.save(preference);
  }
}
