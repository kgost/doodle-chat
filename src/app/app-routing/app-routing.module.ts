import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';

import { LandingComponent } from '../landing/landing.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { SigninComponent } from '../auth/signin/signin.component';
import { MessengerComponent } from '../messenger/messenger.component';
import { SettingsComponent } from '../settings/settings.component';

import { AuthGuard } from '../auth/auth-guard.service';

const AppRoutes: Route[] = [
  { component: LandingComponent, path: '', pathMatch: 'full' },
  { component: SignupComponent, path: 'signup' },
  { component: SigninComponent, path: 'signin' },
  { component: MessengerComponent, path: 'messenger', canActivate: [AuthGuard] },
  { component: MessengerComponent, path: 'messenger/conversations/:id', canActivate: [AuthGuard] },
  { component: MessengerComponent, path: 'messenger/friends/:id', canActivate: [AuthGuard] },
  { component: SettingsComponent, path: 'settings', canActivate: [AuthGuard] },
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
