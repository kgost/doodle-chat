import { Pipe, PipeTransform } from '@angular/core';

import { Message } from '../messages/message.model';
import { Media } from '../messages/media/media.model';
import { Poll } from '../messages/poll/poll.model';

@Pipe({
  name: 'commands'
})
export class CommandsPipe implements PipeTransform {

  transform( message: Message ): Message {
    if ( message.text.indexOf( '!' ) !== 0 ) {
      return message;
    }

    const funcEnd = message.text.match( /\ |$/ )[0];
    const func = message.text.slice( 1, message.text.indexOf( funcEnd ) ).toLowerCase();
    const args = message.text.slice( message.text.indexOf( funcEnd ) + 1 ).split( '|' );

    return this.call( func, args, message );
  }

  private call( func: string, args: string[], message: Message ): Message {
    switch ( func ) {
      case 'img':
        return this.setImage( message, args );
      case 'webm':
        return this.setWebm( message, args );
      case 'poll':
        return this.setPoll( message, args );
      case 'youtube':
        return this.setYoutube( message, args );
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

  private setPoll( message: Message, args: string[] ): Message {
    const answers = args.slice( 1 ).map( ( answer ) => {
      return { text: answer, userIds: [] };
    } );

    if ( message.conversationId ) {
      message.poll = new Poll( args[0], answers, message.conversationId, null );
    } else {
      message.poll = new Poll( args[0], answers, null, message.friendshipId );
    }

    return message;
  }

  private setYoutube( message: Message, args: string[] ): Message {
    let id;

    if ( args[0].match( /v=[A-z0-9]*/ ) ) {
      id = args[0].match( /v=[A-z0-9]*/ )[0].slice( 2 );
    } else if ( args[0].match( /youtu.be\/[A-z0-9]*/ ) ) {
      id = args[0].match( /youtu.be\/[A-z0-9]*/ )[0].slice( 9 );
    }

    message.youtubeId = id;

    return message;
  }
}
