import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { Permission } from '../../database/entities/permission.entity';

const mockPermissionRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn((dto) => dto),
});

describe('PermissionsService', () => {
  let service: PermissionsService;
  let repo: ReturnType<typeof mockPermissionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getRepositoryToken(Permission), useFactory: mockPermissionRepository },
      ],
    }).compile();

    service = module.get(PermissionsService);
    repo = module.get(getRepositoryToken(Permission));
  });

  describe('findAll', () => {
    it('retorna todos los permisos sin filtro', async () => {
      const permissions = [{ id: '1', name: 'users.read', module: 'users' }];
      repo.find.mockResolvedValue(permissions);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({ order: { module: 'ASC', name: 'ASC' } });
      expect(result).toEqual(permissions);
    });

    it('filtra por módulo cuando se pasa module', async () => {
      const permissions = [{ id: '1', name: 'users.read', module: 'users' }];
      repo.find.mockResolvedValue(permissions);

      const result = await service.findAll('users');

      expect(repo.find).toHaveBeenCalledWith({ where: { module: 'users' } });
      expect(result).toEqual(permissions);
    });
  });

  describe('registerPermissions', () => {
    it('crea permisos que no existen', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await service.registerPermissions([
        { name: 'products.read', description: 'Ver productos', module: 'products' },
      ]);

      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('ignora permisos que ya existen', async () => {
      repo.findOneBy.mockResolvedValue({ id: '1', name: 'products.read' });

      await service.registerPermissions([
        { name: 'products.read', description: 'Ver productos', module: 'products' },
      ]);

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('maneja lista vacía sin errores', async () => {
      await service.registerPermissions([]);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
