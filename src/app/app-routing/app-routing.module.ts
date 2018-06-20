import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';

import { LandingComponent } from '../landing/landing.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { SigninComponent } from '../auth/signin/signin.component';
import { MessengerComponent } from '../messenger/messenger.component';
import { ConversationEditComponent } from '../messenger/sidebar/conversations/conversation-edit/conversation-edit.component';

import { AuthGuard } from '../auth/auth-guard.service';

const AppRoutes: Route[] = [
  { component: LandingComponent, path: '', pathMatch: 'full' },
  { component: SignupComponent, path: 'signup' },
  { component: SigninComponent, path: 'signin' },
  { component: MessengerComponent, path: 'messenger', canActivate: [AuthGuard], children: [
    { component: ConversationEditComponent, path: 'conversations/new' },
    { component: ConversationEditComponent, path: 'conversations/:id/edit' },
  ] },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot( AppRoutes )
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
