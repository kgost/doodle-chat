import { Pipe, PipeTransform } from '@angular/core';

import { Message } from '../messages/message.model';
import { Media } from '../messages/media/media.model';

@Pipe({
  name: 'commands'
})
export class CommandsPipe implements PipeTransform {

  transform( message: Message ): Message {
    if ( message.text.indexOf( '!' ) !== 0 ) {
      return message;
    }

    const funcEnd = message.text.match( /\ |$/ )[0];
    const func = message.text.slice( 1, message.text.indexOf( funcEnd ) );
    const args = message.text.slice( message.text.indexOf( funcEnd ) + 1 ).split( ' ' );

    return this.call( func, args, message );
  }

  private call( func: string, args: string[], message: Message ): Message {
    switch ( func ) {
      case 'img':
        return this.setImage( message, args );
      case 'webm':
        return this.setWebm( message, args );
      case 'rolling':
        break;
      default:
        return message;
    }
  }

  private setImage( message: Message, args: string[] ): Message {
    message.media = new Media( 'image/*', null, '', null, args[0] );
    message.text = '';

    return message;
  }

  private setWebm( message: Message, args: string[] ): Message {
    message.media = new Media( 'video/webm', null, '', null, args[0] );
    message.text = '';

    return message;
  }
}
