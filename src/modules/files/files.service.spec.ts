import { jest as jestRuntime } from '@jest/globals';
import { Repository } from 'typeorm';
import { ApiException } from '../../common/exceptions/api.exception.js';
import { File } from '../../database/entities/file.entity.js';
import { User } from '../../database/entities/user.entity.js';
import { AuditService } from '../audit/audit.service.js';
import { SettingsService } from '../settings/settings.service.js';
import { FilesService } from './files.service.js';

const jest = jestRuntime as typeof globalThis.jest;

const file = { id: 'file-1', name: 'old', path: 'stored-file' } as File;
const user = { id: 'user-1', isActive: true, isSystemUser: false, roles: [] } as unknown as User;

describe('FilesService mutation authorization', () => {
  let service: FilesService;
  let fileRepo: { findOne: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let userRepo: { findOne: jest.Mock };
  let audit: { log: jest.Mock };

  beforeEach(() => {
    fileRepo = {
      findOne: jest.fn().mockResolvedValue({ ...file }),
      save: jest.fn().mockResolvedValue({ ...file, name: 'changed' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    userRepo = { findOne: jest.fn().mockResolvedValue(user) };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new FilesService(
      fileRepo as unknown as Repository<File>,
      {} as SettingsService,
      audit as unknown as AuditService,
      userRepo as unknown as Repository<User>,
    );
  });

  it('denies an unauthorized direct edit without loading or saving the file', async () => {
    await expect(service.update(file.id, { name: 'changed' }, user.id)).rejects.toThrow(
      ApiException,
    );
    expect(fileRepo.findOne).not.toHaveBeenCalled();
    expect(fileRepo.save).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('denies an unauthorized direct delete without removing or auditing the file', async () => {
    await expect(service.remove(file.id, user.id)).rejects.toThrow(ApiException);
    expect(fileRepo.findOne).not.toHaveBeenCalled();
    expect(fileRepo.remove).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('fails closed when the user no longer exists', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.update(file.id, { name: 'changed' }, user.id)).rejects.toThrow(
      ApiException,
    );
    expect(fileRepo.save).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('preserves authorized edits through the existing userId signature', async () => {
    userRepo.findOne.mockResolvedValue({
      ...user,
      roles: [{ permissions: [{ name: 'files.edit' }] }],
    });
    await expect(service.update(file.id, { name: 'changed' }, user.id)).resolves.toMatchObject({
      name: 'changed',
    });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { id: user.id, isActive: true },
      relations: { roles: { permissions: true } },
    });
    expect(fileRepo.save).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledTimes(1);
  });

  it('preserves authorized deletes through the existing userId signature', async () => {
    userRepo.findOne.mockResolvedValue({
      ...user,
      roles: [{ permissions: [{ name: 'files.delete' }] }],
    });
    await expect(service.remove(file.id, user.id)).resolves.toBeUndefined();
    expect(fileRepo.remove).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledTimes(1);
  });

  it('preserves the system user bypass for deletes', async () => {
    userRepo.findOne.mockResolvedValue({ ...user, isSystemUser: true });
    await expect(service.remove(file.id, user.id)).resolves.toBeUndefined();
    expect(fileRepo.remove).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledTimes(1);
  });
});
