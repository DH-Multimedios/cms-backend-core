import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DataSource, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity.js';
import { seedUsers } from './users.seeder.js';
import { EnforceSingleSystemUser1733500000103 } from '../migrations/1733500000103-EnforceSingleSystemUser.js';

describe('seedUsers root bootstrap', () => {
  const originalEnv = process.env;
  let users: User[];
  let repository: {
    count: ReturnType<typeof jest.fn>;
    find: ReturnType<typeof jest.fn>;
    findOne: ReturnType<typeof jest.fn>;
    create: ReturnType<typeof jest.fn>;
    save: ReturnType<typeof jest.fn>;
  };
  let dataSource: DataSource;
  let log: ReturnType<typeof jest.spyOn>;
  let warn: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    process.env = {
      SYSTEM_USER_EMAIL: 'root@example.test',
      SYSTEM_USER_PASSWORD: 'bootstrap-password',
    };
    users = [];
    const matches = (user: User, where: Partial<User>) =>
      Object.entries(where).every(([key, value]) => user[key as keyof User] === value);
    repository = {
      count: jest.fn(async ({ where }: { where: Partial<User> }) =>
        users.filter((user) => !user.deletedAt && matches(user, where)).length,
      ),
      find: jest.fn(async ({ where, withDeleted }: { where: Partial<User>; withDeleted?: boolean }) =>
        users.filter((user) => (withDeleted || !user.deletedAt) && matches(user, where)),
      ),
      findOne: jest.fn(async ({ where }: { where: Partial<User> }) =>
        users.find((user) => !user.deletedAt && matches(user, where)) ?? null,
      ),
      create: jest.fn((input: Partial<User>) => ({ isSystemUser: false, ...input })),
      save: jest.fn(async (user: User) => {
        users.push(user);
        return user;
      }),
    };
    const roles = { findOne: jest.fn(async () => ({ name: 'role' })) };
    dataSource = {
      getRepository: (entity: unknown) => (entity === User ? repository : roles),
    } as unknown as DataSource;
    log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  async function existingRoot(overrides: Partial<User> = {}) {
    const root = {
      email: 'root@example.test',
      username: 'personal-root',
      password: await bcrypt.hash('bootstrap-password', 4),
      isSystemUser: true,
      isProtected: true,
      isActive: true,
      ...overrides,
    } as User;
    users.push(root);
    return root;
  }

  it('creates one protected root and leaves it unchanged on rerun', async () => {
    await seedUsers(dataSource);
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      email: 'root@example.test', username: 'system',
      isSystemUser: true, isProtected: true, isActive: true,
    });
    expect(await bcrypt.compare('bootstrap-password', users[0].password)).toBe(true);
    const snapshot = { ...users[0] };
    await seedUsers(dataSource);
    expect(users).toEqual([snapshot]);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(log.mock.calls).toEqual([
      ['✅ Usuario del sistema creado: root@example.test'],
      ['⏭️  Usuario del sistema ya existe'],
    ]);
    expect(warn.mock.calls).toEqual([
      ['⚠️  SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no definidos. SuperAdmin NO creado.'],
      ['⚠️  SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no definidos. SuperAdmin NO creado.'],
    ]);
  });

  it.each(['email', 'password'])('reports mismatched %s without replacing root identity', async (field) => {
    const root = await existingRoot();
    const snapshot = { ...root };
    process.env[field === 'email' ? 'SYSTEM_USER_EMAIL' : 'SYSTEM_USER_PASSWORD'] = 'different';
    await seedUsers(dataSource);
    expect(users).toEqual([snapshot]);
    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(log.mock.calls).toEqual([['⏭️  Usuario del sistema ya existe']]);
    expect(warn.mock.calls).toEqual([
      ['⚠️  Credenciales del sistema no coinciden con el usuario existente. Identidad del sistema conservada.'],
      ['⚠️  SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no definidos. SuperAdmin NO creado.'],
    ]);
  });

  it.each([true, false])('rejects duplicate roots before any writes (credentials present: %s)', async (credentials) => {
    await existingRoot();
    await existingRoot({ email: 'other-root@example.test' });
    if (!credentials) process.env = {};
    const snapshot = users.map((user) => ({ ...user }));
    await expect(seedUsers(dataSource)).rejects.toThrow(
      'Hay más de un usuario del sistema. No se modificó ninguna cuenta.',
    );
    expect(users).toEqual(snapshot);
    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(log.mock.calls).toEqual([]);
    expect(warn.mock.calls).toEqual([]);
  });

  it('counts a soft-deleted root and never replaces or restores it', async () => {
    const root = await existingRoot({ deletedAt: new Date('2025-01-01T00:00:00Z') });
    const snapshot = { ...root };
    await seedUsers(dataSource);
    expect(users).toEqual([snapshot]);
    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(log.mock.calls).toEqual([['⏭️  Usuario del sistema ya existe']]);
    expect(warn.mock.calls).toEqual([
      ['⚠️  SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no definidos. SuperAdmin NO creado.'],
    ]);
  });

  it('preserves optional bootstrap behavior when no credentials are supplied', async () => {
    process.env = {};
    await seedUsers(dataSource);
    expect(users).toEqual([]);
    expect(repository.save).not.toHaveBeenCalled();
    expect(log.mock.calls).toEqual([]);
    expect(warn.mock.calls).toEqual([
      ['⚠️  SYSTEM_USER_EMAIL o SYSTEM_USER_PASSWORD no definidos. Usuario del sistema NO creado.'],
      ['⚠️  SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no definidos. SuperAdmin NO creado.'],
    ]);
  });

  it('preserves ordinary account bootstrap and reruns without duplicating accounts', async () => {
    process.env.SUPERADMIN_EMAIL = 'superadmin@example.test';
    process.env.SUPERADMIN_PASSWORD = 'client-password';
    process.env.ADMIN_EMAIL = 'admin@example.test';
    process.env.ADMIN_PASSWORD = 'client-password';
    process.env.USER_EMAIL = 'user@example.test';
    process.env.USER_PASSWORD = 'client-password';
    await seedUsers(dataSource);
    const snapshot = users.map((user) => ({ ...user }));
    await seedUsers(dataSource);
    expect(users).toEqual(snapshot);
    expect(users).toHaveLength(4);
    expect(users.filter((user) => user.isSystemUser)).toHaveLength(1);
    expect(users.slice(1).map((user) => user.isProtected)).toEqual([true, false, false]);
    expect(repository.save).toHaveBeenCalledTimes(4);
    expect(log.mock.calls).toEqual([
      ['✅ Usuario del sistema creado: root@example.test'],
      ['✅ SuperAdmin creado: superadmin@example.test'],
      ['✅ Admin creado: admin@example.test'],
      ['✅ Usuario normal creado: user@example.test'],
      ['⏭️  Usuario del sistema ya existe'],
      ['⏭️  SuperAdmin ya existe: superadmin@example.test'],
      ['⏭️  Admin ya existe: admin@example.test'],
      ['⏭️  Usuario normal ya existe: user@example.test'],
    ]);
    expect(warn.mock.calls).toEqual([]);
  });
});

describe('single-root migration SQL contract (no database)', () => {
  it('adds only a partial unique index, including inactive and soft-deleted roots', async () => {
    const query = jest.fn(async (_sql: string) => undefined);
    await new EnforceSingleSystemUser1733500000103().up({ query } as unknown as QueryRunner);
    expect(query.mock.calls.map(([sql]) => sql.replace(/\s+/g, ' ').trim())).toEqual([
      'CREATE UNIQUE INDEX "IDX_users_single_system_user" ON "users" ("isSystemUser") WHERE "isSystemUser" = true',
    ]);
  });

  it('propagates database rejection without attempting cleanup or additional SQL', async () => {
    const duplicateError = new Error('could not create unique index: duplicate key');
    const query = jest.fn(async (_sql: string) => { throw duplicateError; });
    await expect(new EnforceSingleSystemUser1733500000103().up(
      { query } as unknown as QueryRunner,
    )).rejects.toBe(duplicateError);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('rolls back only its own index', async () => {
    const query = jest.fn(async (_sql: string) => undefined);
    await new EnforceSingleSystemUser1733500000103().down({ query } as unknown as QueryRunner);
    expect(query.mock.calls).toEqual([['DROP INDEX "IDX_users_single_system_user"']]);
  });
});
