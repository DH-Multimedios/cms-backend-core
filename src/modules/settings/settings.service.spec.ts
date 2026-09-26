import { jest as jestRuntime } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { Setting } from '../../database/entities/setting.entity';
import { SettingCategory } from '../../database/entities/setting-category.entity';
import { Media } from '../../database/entities/media.entity';
import { AuditService } from '../audit/audit.service';
import { PermissionsService } from '../permissions/permissions.service';

const jest = jestRuntime as typeof globalThis.jest;

const mockAuditService = () => ({ log: jest.fn().mockResolvedValue(undefined) });
const mockPermissionsService = () => ({
  registerPermissions: jest.fn().mockResolvedValue(undefined),
});

const makeSetting = (overrides: Partial<Setting> = {}): Setting =>
  ({
    id: 'uuid-1',
    key: 'site_logo',
    label: 'Logo',
    value: 'media-uuid-1',
    type: 'string',
    inputType: 'image',
    meta: null,
    categoryId: 1,
    order: 0,
    isProtected: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Setting;

const makeCategory = (overrides: Partial<SettingCategory> = {}): SettingCategory =>
  ({
    id: 1,
    slug: 'general',
    label: 'General',
    order: 0,
    isProtected: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as SettingCategory;

const makeMedia = (overrides: Partial<Media> = {}): Partial<Media> => ({
  id: 'media-uuid-1',
  url: 'https://cdn.example.com/logo.png',
  alt: 'Logo',
  ...overrides,
});

describe('SettingsService', () => {
  let service: SettingsService;
  let categoryRepo: ReturnType<typeof buildCategoryRepo>;
  let settingRepo: ReturnType<typeof buildSettingRepo>;
  let mediaRepo: ReturnType<typeof buildMediaRepo>;

  const buildCategoryRepo = () => ({
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  });

  const buildSettingRepo = () => ({
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    remove: jest.fn(),
  });

  const buildMediaRepo = () => ({
    findOneBy: jest.fn(),
  });

  beforeEach(async () => {
    categoryRepo = buildCategoryRepo();
    settingRepo = buildSettingRepo();
    mediaRepo = buildMediaRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getRepositoryToken(Setting), useValue: settingRepo },
        { provide: getRepositoryToken(SettingCategory), useValue: categoryRepo },
        { provide: getRepositoryToken(Media), useValue: mediaRepo },
        { provide: AuditService, useFactory: mockAuditService },
        { provide: PermissionsService, useFactory: mockPermissionsService },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  describe('findCategoryBySlug', () => {
    it('should inject image meta for settings with inputType image', async () => {
      const category = makeCategory();
      const imageSetting = makeSetting();
      const media = makeMedia();

      categoryRepo.findOneBy.mockResolvedValue(category);
      settingRepo.findAndCount.mockResolvedValue([[imageSetting], 1]);
      mediaRepo.findOneBy.mockResolvedValue(media);

      const result = await service.findCategoryBySlug('general');

      expect(result.settings[0].meta).toEqual({
        url: 'https://cdn.example.com/logo.png',
        alt: 'Logo',
      });
      expect(mediaRepo.findOneBy).toHaveBeenCalledWith({ id: 'media-uuid-1' });
    });

    it('should leave meta null when setting is not inputType image', async () => {
      const category = makeCategory();
      const textSetting = makeSetting({ inputType: 'text', value: 'hello', meta: null });

      categoryRepo.findOneBy.mockResolvedValue(category);
      settingRepo.findAndCount.mockResolvedValue([[textSetting], 1]);

      const result = await service.findCategoryBySlug('general');

      expect(result.settings[0].meta).toBeNull();
      expect(mediaRepo.findOneBy).not.toHaveBeenCalled();
    });

    it('should leave meta null when image setting has no value', async () => {
      const category = makeCategory();
      const imageSetting = makeSetting({ value: '', meta: null });

      categoryRepo.findOneBy.mockResolvedValue(category);
      settingRepo.findAndCount.mockResolvedValue([[imageSetting], 1]);

      const result = await service.findCategoryBySlug('general');

      expect(result.settings[0].meta).toBeNull();
      expect(mediaRepo.findOneBy).not.toHaveBeenCalled();
    });

    it('should leave meta unchanged when media is not found (graceful degradation)', async () => {
      const category = makeCategory();
      const imageSetting = makeSetting();

      categoryRepo.findOneBy.mockResolvedValue(category);
      settingRepo.findAndCount.mockResolvedValue([[imageSetting], 1]);
      mediaRepo.findOneBy.mockResolvedValue(null);

      const result = await service.findCategoryBySlug('general');

      expect(result.settings[0].meta).toBeNull();
    });

    it('should return pagination metadata correctly', async () => {
      const category = makeCategory();
      categoryRepo.findOneBy.mockResolvedValue(category);
      settingRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findCategoryBySlug('general', 2, 10);

      expect(result.settingsPage).toBe(2);
      expect(result.settingsLimit).toBe(10);
      expect(result.settingsTotal).toBe(0);
      expect(result.settingsPages).toBe(0);
    });
  });
});
