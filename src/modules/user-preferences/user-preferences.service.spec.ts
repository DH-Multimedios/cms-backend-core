import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreference } from '../../database/entities/user-preference.entity';
import { BaseUserPreferencesService } from './base-user-preferences.service';

const mockRepo = () => ({
  findOneBy: jest.fn(),
  create: jest.fn((dto) => ({ ...dto })),
  save: jest.fn((entity) => Promise.resolve({ id: 'pref-1', theme: 'system', ...entity })),
});

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        { provide: getRepositoryToken(UserPreference), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(UserPreferencesService);
    repo = module.get(getRepositoryToken(UserPreference));
  });

  it('debería estar instanciado correctamente', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(BaseUserPreferencesService);
  });

  describe('findOrCreate', () => {
    it('retorna preferencias existentes si ya existen', async () => {
      const existing = { id: 'pref-1', userId: 'user-1', theme: 'dark' as const };
      repo.findOneBy.mockResolvedValue(existing);

      const result = await service.findOrCreate('user-1');

      expect(result).toEqual(existing);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('crea preferencias con defaults si no existen', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await service.findOrCreate('user-1');

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }));
      expect(repo.save).toHaveBeenCalled();
      expect(result.userId).toBe('user-1');
    });
  });

  describe('updatePreferences', () => {
    it('actualiza preferencias existentes', async () => {
      const existing = { id: 'pref-1', userId: 'user-1', theme: 'system' as const };
      repo.findOneBy.mockResolvedValue(existing);

      const result = await service.updatePreferences('user-1', { theme: 'dark' });

      expect(repo.save).toHaveBeenCalled();
      expect(result.theme).toBe('dark');
    });

    it('crea preferencias si no existen y las actualiza', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await service.updatePreferences('user-1', { theme: 'light' });

      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
    });
  });
});
