import { User } from '../../../auth/user.model';

export class Friendship {
  constructor(
    public users: { id: User, accessKey?: string, accepted: boolean }[],
    public _id?: string,
  ) {}
}
