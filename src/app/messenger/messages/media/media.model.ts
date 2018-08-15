export class Media {
  constructor(
    public mime: string,
    public data?: string,
    public _id?: string,
    public size?: {
      width: number,
      height: number
    },
    public externalSrc?: string,
  ) {}
}
