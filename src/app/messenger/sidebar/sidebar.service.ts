import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';

import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/user.model';
import { Conversation } from './conversations/conversation.model';
import { Friendship } from './friends/friendship.model';
import { map } from 'rxjs/operators';
import { Message } from '../messages/message.model';
import { Media } from '../messages/media/media.model';

@Injectable()
export class SidebarService {
  baseUrl = '/api/';
  deactivate = new EventEmitter<void>();

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

  leaveConversation( id: string ) {
    return this.http.get( this.baseUrl + 'conversations/' + id + '/leave?token=' + this.authService.getToken() )
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
   *  FRIENDSHIPS
   */
  createFriendship( friendship: Friendship ) {
    return this.http.post( this.baseUrl + 'friendships?token=' + this.authService.getToken(), friendship )
      .pipe( map( this.mapFriendship ) );
  }

  getFriendships() {
    return this.http.get( this.baseUrl + 'friendships?token=' + this.authService.getToken() )
      .pipe( map( this.mapFriendships ) );
  }

  updateFriendship( id: string, friendship: Friendship ) {
    return this.http.put( this.baseUrl + 'friendships/' + id + '?token=' + this.authService.getToken(), friendship )
      .pipe( map( this.mapFriendship ) );
  }

  removeFriendship( id: string ) {
    return this.http.delete( this.baseUrl + 'friendships/' + id + '?token=' + this.authService.getToken() )
      .pipe( map( ( response: Response ) => {
        return response.json();
      } ) );
  }

  private mapFriendship( response: Response ) {
    const friendship = response.json();

    friendship.users.map( ( user: any ) => {
      user.id = <User> user.id;
      return user;
    } );

    return <Friendship> friendship;
  }

  private mapFriendships( response: Response ) {
    const friendships = response.json().obj;

    friendships.map( ( friendship ) => {
      friendship.users.map( ( user: any ) => {
        user.id = <User> user.id;
        return user;
      } );

      return <Friendship> friendship;
    } );

    return friendships;
  }

  /**
   *  MESSAGES
   */
  createMessage( conversationId: string, message: Message ) {
    return this.http.post( this.baseUrl + 'messages/' + conversationId + '?token=' + this.authService.getToken(), message )
      .pipe( map( this.mapMessage ) );
  }

  createPrivateMessage( friendshipId: string, message: Message ) {
    return this.http.post( this.baseUrl + 'privateMessages/' + friendshipId + '?token=' + this.authService.getToken(), message )
      .pipe( map( this.mapMessage ) );
  }

  getMessages( conversationId: string ) {
    return this.http.get( this.baseUrl + 'messages/' + conversationId + '?token=' + this.authService.getToken() )
      .pipe( map( this.mapMessages ) );
  }

  getMessage( conversationId: string, messageId: string ) {
    return this.http.get( this.baseUrl + 'message/' + conversationId + '/' + messageId + '?token=' + this.authService.getToken() )
      .pipe( map( this.mapMessage ) );
  }

  getPrivateMessages( friendshipId: string ) {
    return this.http.get( this.baseUrl + 'privateMessages/' + friendshipId + '?token=' + this.authService.getToken() )
      .pipe( map( this.mapMessages ) );
  }

  getPrivateMessage( friendshipId: string, messageId: string ) {
    return this.http.get( this.baseUrl + 'privateMessage/' + friendshipId + '/' + messageId + '?token=' + this.authService.getToken() )
      .pipe( map( this.mapMessage ) );
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
    const data = response.json();
    if ( data ) {
      if ( data.media ) {
        data.media = new Media( data.media.mime, null, data.media.id );
      }
    }
    return <Message>data;
  }

  private mapMessages( response: Response ) {
    const messages = response.json().obj;

    messages.map( ( message: any ) => {
      if ( message.media ) {
        message.media = new Media( message.media.mime, null, message.media.id );
      }
      return <Message>message;
    } );

    return messages;
  }

  getNotifications() {
    return this.http.get( this.baseUrl + 'notifications?token=' + this.authService.getToken() )
      .pipe( map( ( response: Response ) => {
        return response.json();
      } ) );
  }

  removeConversationNotification( id: string ) {
    return this.http.delete( this.baseUrl + 'notifications/conversation/' + id + '?token=' + this.authService.getToken() )
      .pipe( map( ( response: Response ) => {
        return response.json();
      } ) );
  }

  removeFriendshipNotification( id: string ) {
    return this.http.delete( this.baseUrl + 'notifications/friendship/' + id + '?token=' + this.authService.getToken() )
      .pipe( map( ( response: Response ) => {
        return response.json();
      } ) );
  }
}
