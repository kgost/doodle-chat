export class Poll {
  constructor(
    public question: string,
    public answers: { text: string, userIds: string[] }[],
    public _id?: string,
  ) {}
}
