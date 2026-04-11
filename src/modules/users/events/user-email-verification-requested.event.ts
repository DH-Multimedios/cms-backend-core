import { User } from '../../../database/entities/user.entity';

export class UserEmailVerificationRequestedEvent {
  constructor(
    public readonly user: User,
    public readonly verificationToken: string,
  ) {}
}
