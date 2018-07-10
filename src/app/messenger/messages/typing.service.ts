import { Injectable, EventEmitter } from '@angular/core';

import { SocketIoService } from '../../shared/socket-io.service';

@Injectable()
export class TypingService {
  stopTyping = new EventEmitter<string>();

  constructor(
  ) { }
}
