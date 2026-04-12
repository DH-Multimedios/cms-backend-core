import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from '../../../database/entities/user-preference.entity';
import { BaseUserPreferencesService } from './base-user-preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';

@Injectable()
export class UserPreferencesService extends BaseUserPreferencesService<UserPreference> {
  constructor(
    @InjectRepository(UserPreference)
    repository: Repository<UserPreference>,
  ) {
    super(repository);
  }

  async updatePreferences(userId: string, dto: UpdateUserPreferenceDto): Promise<UserPreference> {
    return this.update(userId, dto);
  }
}
