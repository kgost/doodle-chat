export class Poll {
  constructor(
    public question: string,
    public answers: { text: string, userIds: string[] }[],
    public conversationId: string,
    public friendshipId: string,
    public _id?: string,
  ) {}
}
