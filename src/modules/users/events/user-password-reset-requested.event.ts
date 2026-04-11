import { User } from '../../../database/entities/user.entity';

export class UserPasswordResetRequestedEvent {
  constructor(
    public readonly user: User,
    public readonly resetToken: string,
  ) {}
}
