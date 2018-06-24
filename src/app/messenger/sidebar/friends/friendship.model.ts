import { User } from '../../../auth/user.model';

export class Friendship {
  constructor(
    public users: { id: User, accepted: boolean }[],
    public _id?: string
  ) {}
}
