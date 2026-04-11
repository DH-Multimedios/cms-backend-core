import { User } from '../../../database/entities/user.entity';

export class UserCreatedEvent {
  constructor(
    public readonly user: User,
    public readonly verificationToken: string,
  ) {}
}
