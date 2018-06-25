import { Media } from './media/media.model';

export class Message {
  constructor(
    public user: string,
    public text: string,
    public conversationId?: string,
    public friendshipId?: string,
    public media?: Media,
    public _id?: string,
    public username?: string,
  ) {}
}
