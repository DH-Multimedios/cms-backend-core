'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { DataSource } = require('typeorm');
const {
  CORE_ENTITIES,
  EmailLayout,
  EmailTemplate,
  EntityTaxonomy,
  Media,
  NotificationType,
  Permission,
  Role,
  Setting,
  SettingCategory,
  SettingsService,
  Taxonomy,
  TaxonomiesService,
  User,
  runCoreSeeds,
} = require('../dist');

const database = process.env.FRESH_DB_NAME || 'backend_core_fresh_test';
const host = process.env.FRESH_DB_HOST || 'localhost';
const port = Number(process.env.FRESH_DB_PORT || 55432);
const username = process.env.FRESH_DB_USERNAME || 'postgres';
const password = process.env.FRESH_DB_PASSWORD || 'postgres';

if (!/^[a-zA-Z0-9_]+_test$/.test(database)) {
  throw new Error(`Refusing to erase database "${database}": FRESH_DB_NAME must end in _test`);
}

process.env.SYSTEM_USER_EMAIL ||= 'system@fresh-install.test';
process.env.SYSTEM_USER_PASSWORD ||= 'fresh-install-system-password';
process.env.SUPERADMIN_EMAIL ||= 'admin@fresh-install.test';
process.env.SUPERADMIN_PASSWORD ||= 'fresh-install-admin-password';
process.env.ADMIN_EMAIL ||= 'support@fresh-install.test';
process.env.ADMIN_PASSWORD ||= 'fresh-install-support-password';

const dataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  entities: [...CORE_ENTITIES],
  migrations: [path.join(__dirname, '../dist/database/migrations/*.js')],
  synchronize: false,
  logging: false,
});

async function ensureDatabaseExists() {
  const adminDataSource = new DataSource({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database: 'postgres',
  });

  try {
    await adminDataSource.initialize();
    const existing = await adminDataSource.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      database,
    ]);
    if (existing.length === 0) {
      await adminDataSource.query(`CREATE DATABASE "${database}"`);
    }
  } finally {
    if (adminDataSource.isInitialized) {
      await adminDataSource.destroy();
    }
  }
}

async function recordCounts() {
  const entities = [
    Role,
    Permission,
    User,
    SettingCategory,
    Setting,
    EmailLayout,
    EmailTemplate,
    NotificationType,
  ];

  return Object.fromEntries(
    await Promise.all(
      entities.map(async (entity) => [entity.name, await dataSource.getRepository(entity).count()]),
    ),
  );
}

async function verify() {
  await ensureDatabaseExists();
  await dataSource.initialize();

  try {
    await dataSource.dropDatabase();

    const migrations = await dataSource.runMigrations({ transaction: 'all' });
    assert.equal(migrations.length, 3, 'all three packaged migrations must execute');
    assert.equal(
      await dataSource.showMigrations(),
      false,
      'no packaged migration may remain pending',
    );

    await runCoreSeeds(dataSource);

    const roles = await dataSource.getRepository(Role).find({ order: { name: 'ASC' } });
    assert.deepEqual(
      roles.map(({ name }) => name),
      ['admin', 'super_admin', 'user'],
      'core roles must be seeded',
    );
    assert.ok(await dataSource.getRepository(Permission).findOneBy({ name: 'users.read' }));
    assert.ok(await dataSource.getRepository(Setting).findOneBy({ key: 'auth.sessionExpiration' }));
    assert.ok(await dataSource.getRepository(NotificationType).findOneBy({ key: 'user.welcome' }));
    assert.equal(
      await dataSource.getRepository(User).count(),
      3,
      'configured core users must be seeded',
    );

    const settingsService = new SettingsService(
      dataSource.getRepository(Setting),
      dataSource.getRepository(SettingCategory),
      dataSource.getRepository(Media),
      {},
      {},
    );
    const categories = await settingsService.findAllCategories();
    assert.equal(
      categories.items.reduce((total, category) => total + category.settingsCount, 0),
      await dataSource.getRepository(Setting).count(),
      'TypeORM v1 relation-count replacement must map setting counts',
    );

    const taxonomyRepository = dataSource.getRepository(Taxonomy);
    const parent = await taxonomyRepository.save(
      taxonomyRepository.create({ name: 'Parent', slug: 'parent', type: 'verification' }),
    );
    await taxonomyRepository.save(
      taxonomyRepository.create({
        name: 'Child',
        slug: 'child',
        type: 'verification',
        parentId: parent.id,
      }),
    );
    const taxonomiesService = new TaxonomiesService(
      taxonomyRepository,
      dataSource.getRepository(EntityTaxonomy),
      {},
      {},
    );
    const taxonomies = await taxonomiesService.findAll({});
    assert.equal(
      taxonomies.items.find(({ id }) => id === parent.id).childrenCount,
      1,
      'TypeORM v1 relation-count replacement must map taxonomy child counts',
    );

    const firstCounts = await recordCounts();
    await runCoreSeeds(dataSource);
    const secondCounts = await recordCounts();
    assert.deepEqual(
      secondCounts,
      firstCounts,
      'running core seeds twice must not create duplicates',
    );

    console.log(
      JSON.stringify(
        {
          database,
          migrations: migrations.map(({ name }) => name),
          seededRecords: secondCounts,
          idempotent: true,
        },
        null,
        2,
      ),
    );
  } finally {
    await dataSource.destroy();
  }
}

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
