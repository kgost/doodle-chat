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
  editKey: string;
  friendNames: string[] = [];
  colors: { id?: string, color: string }[] = [];

  constructor(
    private conversationService: ConversationService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.friendNames = this.conversationService.getFriendNames();
    this.editId = this.conversation._id;

    if ( this.editId !== undefined && this.editId.length > 0 ) {
      this.editMode = true;
      this.editKey = this.getAccessKey( this.authService.getCurrentUser()._id );
    }

    this.initForm();
  }

  private initForm() {
    let conversationName = '';
    const participants = new FormArray([]);
    const nicknames = new FormArray([]);

    if ( this.editMode ) {
      conversationName = this.conversation.name;

      for ( const participant of this.conversation.participants ) {
        participants.push( new FormControl( participant.id.username, Validators.required, this.usernameValid.bind( this ) ) );
        nicknames.push( new FormControl( participant.nickname ) );

        if ( participant.id._id === this.authService.getCurrentUser()._id ) {
          this.colors = participant.colors.slice();
        }
      }
    } else {
      participants.push( new FormControl( null, Validators.required, this.usernameValid.bind( this ) ) );
      this.colors = [{color: '#ffffff'}];
    }

    this.editForm = new FormGroup({
      'name': new FormControl( conversationName, Validators.required ),
      'participants': participants,
      'nicknames': nicknames,
    });
  }

  onAddParticipant() {
    ( <FormArray> this.editForm.get( 'participants' ) ).push(
      new FormControl( null, Validators.required, this.usernameValid.bind( this ) )
    );

    ( <FormArray> this.editForm.get( 'nicknames' ) ).push(
      new FormControl( null )
    );

    this.colors.push({ color: '#ffffff' });
  }

  onRemoveParticipant( index: number ) {
    ( <FormArray> this.editForm.get('participants') ).removeAt( index );
    ( <FormArray> this.editForm.get('nicknames') ).removeAt( index );
    this.colors.splice( index, 1 );
  }

  onSubmit() {
    if ( this.editForm.valid ) {
      const users: { id: User, nickname?: string, accessKey?: string }[] = [];

      for ( let i = 0; i < this.editForm.value.participants.length; i++ ) {
        users.push( { id: new User( this.editForm.value.participants[i] ), nickname: this.editForm.value.nicknames[i] } );
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
        this.conversationService.updateConversation( this.editId, this.editKey, conversation, this.colors );
      } else {
        this.conversationService.addConversation( conversation, this.colors );
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

  forceCheck( event: string, index: number ) {
    ( <FormArray> this.editForm.get('participants') ).controls[index].patchValue( event );
  }

  getParticipantsArray() { return <FormArray> this.editForm.get('participants'); }

  private getAccessKey( userId: string ) {
    for ( let i = 0; i < this.conversation.participants.length; i++ ) {
      if ( this.conversation.participants[i].id._id === userId ) {
        return this.conversation.participants[i].accessKey;
      }
    }
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
