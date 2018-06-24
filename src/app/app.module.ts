import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

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

import { SidebarService } from './messenger/sidebar/sidebar.service';
import { NotificationService } from './messenger/sidebar/notification.service';
import { ConversationService } from './messenger/sidebar/conversations/conversation.service';
import { FriendService } from './messenger/sidebar/friends/friend.service';
import { MessageService } from './messenger/messages/message.service';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth-guard.service';
import { SocketIoService } from './shared/socket-io.service';

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
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
