import { User } from '../../../auth/user.model';

export class Conversation {
  constructor(
    public name: string,
    public owner: User,
    public participants:
      {
        id: User,
        accessKey?: string,
        nickname?: string,
        colors?: { id: string, color: string }[]
      }[],
    public _id?: string,
    public forceSelect?: boolean,
  ) {}
}
