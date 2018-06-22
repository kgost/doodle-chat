import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io';

@Injectable()
export class SocketIoService {
  private io: socketIo.Server;

  constructor() { }

  signIn() {
  }
}
