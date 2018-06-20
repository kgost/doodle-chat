import { User } from '../../../auth/user.model';

export class Conversation {
  constructor(
    public name: string,
    public owner: User,
    public participants: User[],
    public _id?: string,
  ) {}
}
