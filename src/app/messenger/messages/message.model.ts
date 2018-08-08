import { Media } from './media/media.model';
import { Poll } from './poll/poll.model';

export class Message {
  constructor(
    public user: string,
    public text: string,
    public conversationId?: string,
    public friendshipId?: string,
    public media?: Media,
    public poll?: Poll,
    public _id?: string,
    public username?: string,
    public scrollTop?: number,
    public reactions?: { username: string, text: string }[],
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
