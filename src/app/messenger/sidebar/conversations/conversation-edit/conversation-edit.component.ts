import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { User } from '../../../../auth/user.model';
import { AuthService } from '../../../../auth/auth.service';
import { Conversation } from '../conversation.model';
import { ConversationService } from '../conversation.service';

@Component({
  selector: 'app-conversation-edit',
  templateUrl: './conversation-edit.component.html',
  styleUrls: ['./conversation-edit.component.css']
})
export class ConversationEditComponent implements OnInit {
  @Input() conversation: Conversation;
  editForm: FormGroup;
  editMode = false;
  editId: string;

  constructor(
    private conversationService: ConversationService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.editId = this.conversation._id;

    if ( this.editId !== undefined && this.editId.length > 0 ) {
      this.editMode = true;
    }

    this.initForm();
  }

  private initForm() {
    console.log( this.conversation );
    let conversationName = '';
    const participants = new FormArray([]);

    if ( this.editMode ) {
      conversationName = this.conversation.name;

      for ( const participant of this.conversation.participants ) {
        participants.push( new FormControl( participant.id.username, Validators.required, this.usernameValid.bind( this ) ) );
      }
    } else {
      participants.push( new FormControl( null, Validators.required, this.usernameValid.bind( this ) ) );
    }

    this.editForm = new FormGroup({
      'name': new FormControl( conversationName, Validators.required ),
      'participants': participants
    });
  }

  onAddParticipant() {
    ( <FormArray> this.editForm.get( 'participants' ) ).push(
      new FormControl( null, Validators.required, this.usernameValid.bind( this ) )
    );
  }

  onRemoveParticipant( index: number ) {
    ( <FormArray> this.editForm.get('participants') ).removeAt( index );
  }

  onSubmit() {
    if ( this.editForm.valid ) {
      const users: { id: User, accessKey?: string }[] = [];

      for ( const username of this.editForm.value.participants ) {
        users.push( { id: new User( username ) } );
      }

      let self = false;

      for ( let i = 0; i < users.length; i++ ) {
        if ( users[i].id.username === this.authService.getCurrentUser().username ) {
          self = true;
          break;
        }
      }

      if ( !self ) {
        users.push( { id: this.authService.getCurrentUser() } );
      }

      const conversation = new Conversation( this.editForm.value.name, this.authService.getCurrentUser(), users );

      if ( this.editMode ) {
        conversation._id = this.editId;
        this.conversationService.updateConversation( this.editId, conversation );
      } else {
        this.conversationService.addConversation( conversation );
      }

      this.editForm.reset();
      this.conversationService.editChange.next( null );
    }
  }

  onRemoveConversation() {
    if ( this.editMode ) {
      this.conversationService.removeConversation( this.editId );
      this.conversationService.editChange.next( null );
    }
  }

  onClose() {
    this.conversationService.editChange.next( null );
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
