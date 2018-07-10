import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { BROWSER_FAVICONS_CONFIG } from './favicons';
import { BrowserFavicons } from './favicons';
import { Favicons } from './favicons';

import { AppRoutingModule } from './app-routing/app-routing.module';

import { AppComponent } from './app.component';
import { MessengerComponent } from './messenger/messenger.component';
import { MessagesComponent } from './messenger/messages/messages.component';
import { MessageListComponent } from './messenger/messages/message-list/message-list.component';
import { MessageItemComponent } from './messenger/messages/message-item/message-item.component';
import { SidebarComponent } from './messenger/sidebar/sidebar.component';
import { ConversationsComponent } from './messenger/sidebar/conversations/conversations.component';
import { ConversationListComponent } from './messenger/sidebar/conversations/conversation-list/conversation-list.component';
import { MessageEditComponent } from './messenger/messages/message-edit/message-edit.component';
import { ConversationItemComponent } from './messenger/sidebar/conversations/conversation-item/conversation-item.component';
import { FriendsComponent } from './messenger/sidebar/friends/friends.component';
import { FriendListComponent } from './messenger/sidebar/friends/friend-list/friend-list.component';
import { FriendItemComponent } from './messenger/sidebar/friends/friend-item/friend-item.component';
import { FriendEditComponent } from './messenger/sidebar/friends/friend-edit/friend-edit.component';
import { ConversationEditComponent } from './messenger/sidebar/conversations/conversation-edit/conversation-edit.component';
import { HeaderComponent } from './shared/header/header.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { LandingComponent } from './landing/landing.component';
import { MediaComponent } from './messenger/messages/media/media.component';
import { AlertComponent } from './alert/alert.component';
import { NotificationSoundComponent } from './messenger/sidebar/notification-sound/notification-sound.component';
import { TypingComponent } from './messenger/messages/typing/typing.component';

import { SidebarService } from './messenger/sidebar/sidebar.service';
import { NotificationService } from './messenger/sidebar/notification.service';
import { ConversationService } from './messenger/sidebar/conversations/conversation.service';
import { FriendService } from './messenger/sidebar/friends/friend.service';
import { MessageService } from './messenger/messages/message.service';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth-guard.service';
import { SocketIoService } from './shared/socket-io.service';
import { TypingService } from './messenger/messages/typing.service';
import { LinkPipe } from './messenger/messages/link.pipe';
import { DcryptPipe } from './messenger/messages/dcrypt.pipe';
import { EmojifyPipe } from './messenger/messages/emojify.pipe';
import { Decode8Pipe } from './messenger/messages/decode8.pipe';
import { NormalizePipe } from './messenger/messages/normalize.pipe';

const config: SocketIoConfig = { url: '/', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    MessengerComponent,
    MessagesComponent,
    MessageListComponent,
    MessageItemComponent,
    SidebarComponent,
    ConversationsComponent,
    ConversationListComponent,
    MessageEditComponent,
    ConversationItemComponent,
    FriendsComponent,
    FriendListComponent,
    FriendItemComponent,
    FriendEditComponent,
    ConversationEditComponent,
    HeaderComponent,
    SignupComponent,
    SigninComponent,
    LandingComponent,
    MediaComponent,
    LinkPipe,
    AlertComponent,
    DcryptPipe,
    EmojifyPipe,
    Decode8Pipe,
    NormalizePipe,
    NotificationSoundComponent,
    TypingComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SocketIoModule.forRoot( config )
  ],
  providers: [
    AuthService,
    AuthGuard,
    SidebarService,
    ConversationService,
    FriendService,
    MessageService,
    SocketIoService,
    Decode8Pipe,
    NotificationService,
    TypingService,
    {
      provide: Favicons,
      useClass: BrowserFavicons
    },
    {
      provide: BROWSER_FAVICONS_CONFIG,
      useValue: {
        icons: {
          'inactive': {
            type: 'image/jpg',
            href: './assets/images/inactive.jpg',
            isDefault: true
          },
          'active': {
            type: 'image/jpg',
            href: './assets/images/active.jpg'
          }
        },
        cacheBusting: true
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
