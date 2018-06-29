import { User } from '../../../auth/user.model';

export class Conversation {
  constructor(
    public name: string,
    public owner: User,
    public participants: { id: User, accessKey?: string }[],
    public _id?: string,
  ) {}
}
