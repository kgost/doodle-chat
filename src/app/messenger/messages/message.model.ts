export class Message {
  constructor(
    public user: string,
    public conversationId: string,
    public text: string,
    public media?: { mime: string, data: string },
    public _id?: string,
    public username?: string,
  ) {}
}
