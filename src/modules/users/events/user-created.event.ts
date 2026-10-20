import { User } from '../../../database/entities/user.entity.js';

export class UserCreatedEvent {
  constructor(public readonly user: User) {}
}
