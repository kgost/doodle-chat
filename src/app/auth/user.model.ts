export class User {
  constructor(
    public username: string,
    public _id?: string,
    public publicKey?: string,
    public pushSub?: any,
  ) {}
}
