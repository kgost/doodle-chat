import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/user.model';
import { Conversation } from './conversations/conversation.model';
import { map } from 'rxjs/operators';
import { Message } from '../messages/message.model';

@Injectable()
export class SidebarService {
  baseUrl = '/api/';

  constructor(
    private http: Http,
    private authService: AuthService,
  ) { }

  /**
   *  CONVERSATIONS
   */
  createConversation( conversation: Conversation ) {
    return this.http.post( this.baseUrl + 'conversations?token=' + this.authService.getToken(), conversation )
      .pipe( map( this.mapConversation ) );
  }

  getConversations() {
    return this.http.get( this.baseUrl + 'conversations?token=' + this.authService.getToken() )
      .pipe( map( ( response: Response ) => {
        const data = response.json().obj;

        data.map( ( conversation: any ) => {
          conversation.participants.map( ( participant: any ) => {
            return <User>participant;
          } );

          return <Conversation>conversation;
        } );

        return data;
      } ) );
  }

  updateConversation( id: string, conversation: Conversation ) {
    return this.http.put( this.baseUrl + 'conversations/' + id + '?token=' + this.authService.getToken(), conversation )
      .pipe( map( this.mapConversation ) );
  }

  removeConversation( id: string ) {
    return this.http.delete( this.baseUrl + 'conversations/' + id + '?token=' + this.authService.getToken() )
      .pipe( map( ( response: Response ) => {
        return response.json();
      } ) );
  }

  private mapConversation( response: Response ) {
    const data = response.json();

    data.participants.map( ( participant: any ) => {
      return <User>participant;
    } );

    return <Conversation>data;
  }

  /**
   *  MESSAGES
   */
  createMessage( conversationId: string, message: Message ) {
    return this.http.post( this.baseUrl + 'messages/' + conversationId + '?token=' + this.authService.getToken(), message )
      .pipe( map( this.mapMessage ) );
  }

  getMessages( conversationId: string ) {
    return this.http.get( this.baseUrl + 'messages/' + conversationId + '?token=' + this.authService.getToken() )
      .pipe( map( this.mapMessages ) );
  }

  updateMessage( id: string, message: Message ) {
    return this.http.put( this.baseUrl + 'messages/' + id + '?token=' + this.authService.getToken(), message )
      .pipe( map( this.mapMessage ) );
  }

  removeMessage( id: string ) {
    return this.http.delete( this.baseUrl + 'messages/' + id + '?token=' + this.authService.getToken() )
      .pipe( map( ( response: Response ) => {
        return response.json();
      } ) );
  }

  private mapMessage( response: Response ) {
    return <Message>response.json();
  }

  private mapMessages( response: Response ) {
    const messages = response.json().obj;

    messages.map( ( message: any ) => {
      return <Message>message;
    } );

    return messages;
  }
}