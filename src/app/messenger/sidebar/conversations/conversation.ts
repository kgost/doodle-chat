import { User } from '../../../auth/user.model';

export class Conv {
  public name: string;
  public owner: User;
  public participants: { id: User, accessKey?: string }[];
  public _id: string;

  public getAccessKey( userId: string ): string  {
    for ( let i = 0; i < this.participants.length; i++ ) {
      if ( this.participants[i].id._id === userId ) {
        return this.participants[i].accessKey;
      }
    }
  }

  constructor(
    name: string,
    owner: User,
    participants: { id: User, accessKey?: string }[],
    _id?: string,
  ) {
    this.name = name;
    this.owner = owner;
    this.participants = participants;
    this._id = _id;
  }

}
