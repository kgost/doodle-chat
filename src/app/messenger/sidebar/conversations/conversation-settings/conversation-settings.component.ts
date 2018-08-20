import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { User } from '../../../../auth/user.model';

import { AuthService } from '../../../../auth/auth.service';
import { Conversation } from '../conversation.model';
import { ConversationService } from '../conversation.service';

@Component({
  selector: 'app-conversation-settings',
  templateUrl: './conversation-settings.component.html',
  styleUrls: ['./conversation-settings.component.css']
})
export class ConversationSettingsComponent implements OnInit {
  @Input() conversation: Conversation;
  editForm: FormGroup;
  editMode = false;

  constructor(
    private conversationService: ConversationService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const nicknames = new FormArray([]);

    for ( const participant of this.conversation.participants ) {
      nicknames.push( new FormControl( participant.nickname ) );
    }

    this.editForm = new FormGroup({
      'nicknames': nicknames,
    });
  }

  onSubmit() {
    if ( this.editForm.valid ) {
      const users: { id: User, nickname?: string, accessKey?: string }[] = [];

      for ( let i = 0; i < this.conversation.participants.length; i++ ) {
        users.push( { id: this.conversation.participants[i].id, nickname: this.editForm.value.nicknames[i] } );
      }

      const conversation = new Conversation( this.conversation.name, this.conversation.owner, users, this.conversation._id );

      this.conversationService.changeNicknames( this.conversation._id, conversation );
      this.editForm.reset();
      this.conversationService.settingsChange.next( null );
    }
  }

  onLeaveConversation() {
    this.conversationService.leaveConversation( this.conversation._id );
    this.conversationService.settingsChange.next( null );
  }

  onClose() {
    this.conversationService.settingsChange.next( null );
  }

  getNicknamesArray() { return <FormArray> this.editForm.get('nicknames'); }
}
