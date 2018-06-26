import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { User } from '../user.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.signupForm = new FormGroup({
      'username': new FormControl( null, Validators.required, this.usernameTaken.bind( this ) ),
      'password': new FormControl( null, [Validators.required, Validators.minLength( 6 )] ),
    });
  }

  onSubmit() {
    this.authService.signup( this.signupForm.value.username, this.signupForm.value.password );
  }

  private usernameTaken( control: FormControl ): Promise<any> | Observable<any> {
    return new Promise<any>( ( resolve, reject ) => {
      this.authService.usernameTaken( control.value )
        .subscribe( ( taken: boolean ) => {
          if ( taken ) {
            resolve( { usernameTaken: true } );
          } else {
            resolve( null );
          }
        } );
    } );
  }
}
