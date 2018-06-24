import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { User } from '../../../../auth/user.model';
import { AuthService } from '../../../../auth/auth.service';
import { Friendship } from '../friendship.model';
import { FriendService } from '../friend.service';

@Component({
  selector: 'app-friend-edit',
  templateUrl: './friend-edit.component.html',
  styleUrls: ['./friend-edit.component.css']
})
export class FriendEditComponent implements OnInit {
  @Input() friendship: Friendship;
  editForm: FormGroup;

  constructor(
    private authService: AuthService,
    private friendService: FriendService
  ) { }

  ngOnInit() {
    this.editForm = new FormGroup({
      'username': new FormControl( null, Validators.required, this.usernameValid.bind( this ) )
    });
  }

  onSubmit() {
    if ( this.editForm.valid ) {
      const friendship = new Friendship([
        { id: this.authService.getCurrentUser() , accepted: true },
        { id: new User( this.editForm.value.username ), accepted: false }
      ]);

      this.friendService.addFriendship( friendship );

      this.editForm.reset();
      this.friendService.editChange.next( null );
    }
  }

  onClose() {
    this.friendService.editChange.next( null );
  }

  private usernameValid( control: FormControl ): Promise<any> | Observable<any> {
    return new Promise<any>( ( resolve, reject ) => {
      this.authService.usernameTaken( control.value )
        .subscribe( ( taken: boolean ) => {
          if ( !taken ) {
            resolve( { usernameInvalid: true } );
          } else {
            resolve( null );
          }
        } );
    } );
  }
}
