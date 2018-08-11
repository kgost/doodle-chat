import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/user.model';
import { Conversation } from './conversations/conversation.model';
import { Friendship } from './friends/friendship.model';
import { map } from 'rxjs/operators';
import { Message } from '../messages/message.model';
import { Media } from '../messages/media/media.model';
import { Poll } from '../messages/poll/poll.model';

@Injectable()
export class SidebarService {
  baseUrl = '/api/';
  deactivate = new EventEmitter<void>();
  activeConversationId: string;
  activeFriendshipId: string;
  friendNamesSubject = new Subject<string[]>();
  scrollSubject = new Subject<{ height: number, conversations: boolean }>();
  initialLoad = true;

  constructor(
    private http: Http,
    private authService: AuthService,
  ) { }

  /**
   *  CONVERSATIONS
   */
  createConversation( conversation: Conversation ): Observable<Conversation> {
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
    return <Conversation>response.json();
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
      .pipe( map( this.mapFriendships.bind( this ) ) );
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

    friendship.users = friendship.users.map( ( user: any ) => {
      user.id = <User> user.id;
      return user;
    } );

    return <Friendship> friendship;
  }

  private mapFriendships( response: Response ) {
    let friendships = response.json().obj;
    const friendNames = [];

    friendships = friendships.map( ( friendship ) => {
      friendship.users = friendship.users.map( ( user: any ) => {
        user.id = <User> user.id;

        if ( user.id._id !== this.authService.getCurrentUser()._id ) {
          friendNames.push( user.id.username );
        }

        return user;
      } );

      return <Friendship> friendship;
    } );

    this.friendNamesSubject.next( friendNames );
    return friendships;
  }

  /**
   *  MESSAGES
   */
  createMessage( conversationId: string, message: Message ) {
    return this.http.post( this.baseUrl + 'messages/' + conversationId + '?token=' + this.authService.getToken(), message )
      .pipe( map( this.mapMessage ) );
  }

  postReaction( messageId: string, conversationId: string, emoji: string ) {
    return this.http.post( this.baseUrl + 'message/' + conversationId + '/' + messageId + '/reaction?token=' +
      this.authService.getToken(), { reaction: emoji } )
      .pipe( map( this.mapMessage ) );
  }

  createPrivateMessage( friendshipId: string, message: Message ) {
    return this.http.post( this.baseUrl + 'privateMessages/' + friendshipId + '?token=' + this.authService.getToken(), message )
      .pipe( map( this.mapMessage ) );
  }

  postPrivateReaction( messageId: string, friendshipId: string, emoji: string ) {
    return this.http.post( this.baseUrl + 'privateMessage/' + friendshipId + '/' + messageId + '/reaction?token=' +
      this.authService.getToken(), { reaction: emoji } )
      .pipe( map( this.mapMessage ) );
  }

  getMessages( conversationId: string ) {
    return this.http.get( this.baseUrl + 'messages/' + conversationId + '?token=' + this.authService.getToken() )
      .pipe( map( this.mapMessages ) );
  }

  getPreviousMessages( conversationId: string, messageId: string ) {
    return this.http.get( this.baseUrl + 'messages/' + conversationId + '?id=' + messageId + '&token=' + this.authService.getToken() )
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

  getPreviousPrivateMessages( friendshipId: string, messageId: string ) {
    return this.http.get( this.baseUrl + 'privateMessages/' + friendshipId + '?id=' + messageId + '&token=' + this.authService.getToken() )
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
        data.media = new Media( data.media.mime, null, data.media.id, data.media.size, data.media.externalSrc );
      }

      if ( data.poll ) {
        if ( data.poll.conversationId ) {
          data.poll = new Poll( data.poll.question, data.poll.answers, data.poll.conversationId, null, data.poll._id );
        } else {
          data.poll = new Poll( data.poll.question, data.poll.answers, null, data.poll.friendshipId, data.poll._id );
        }
      }
    }

    return <Message>data;
  }

  private mapMessages( response: Response ) {
    let messages = response.json().obj;

    messages = messages.map( ( message: any ) => {
      if ( message.media ) {
        message.media = new Media( message.media.mime, null, message.media.id, message.media.size, message.media.externalSrc );
      }

      if ( message.poll ) {
        if ( message.poll.conversationId ) {
          message.poll = new Poll( message.poll.question, message.poll.answers, message.poll.conversationId, null, message.poll._id );
        } else {
          message.poll = new Poll( message.poll.question, message.poll.answers, null, message.poll.friendshipId, message.poll._id );
        }
      }

      return <Message>message;
    } );

    return messages;
  }

  /**
   *  NOTIFICATIONS
   */
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

  /**
   *  CRYPTO
   */
  getPublicKeys( participants: { id: User, accessKey?: string }[] ) {
    const usernames = participants.map( ( participant ) => {
      return participant.id.username;
    } );
    return this.http.post( this.baseUrl + 'publicKeys?token=' + this.authService.getToken(), usernames )
      .pipe( map( ( response: Response ) => {
        return response.json().obj;
      } ) );
  }

  pollVote( poll: Poll, index: number ) {
    let route;

    if ( poll.conversationId ) {
      route = `conversations/${ poll.conversationId }/poll/${ poll._id }/${ index }/`;
    } else {
      route = `friendships/${ poll.friendshipId }/poll/${ poll._id }/${ index }/`;
    }

    return this.http.get( this.baseUrl + route + `?token=${ this.authService.getToken() }` )
      .pipe( map( ( response: Response ) => {
        return response.json();
      } ) );
  }
}
