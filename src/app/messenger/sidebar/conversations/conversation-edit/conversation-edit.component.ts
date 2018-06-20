import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';

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
  editForm: FormGroup;
  editMode = false;
  editId: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private conversationService: ConversationService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(
      ( params: Params ) => {
        this.editId = params['id'];
        if ( this.editId !== undefined && this.editId.length > 0 ) {
          this.editMode = true;
        }
        this.initForm();
      }
    );
  }

  private initForm() {
    let conversationName = '';
    const participants = new FormArray([]);

    if ( this.editMode ) {
      const conversation = this.conversationService.getConversation( this.editId );

      if ( !conversation ) {
        this.router.navigate( ['/messenger'] );
      }

      conversationName = conversation.name;

      for ( const participant of conversation.participants ) {
        participants.push( new FormControl( participant.username, Validators.required ) );
      }
    } else {
      participants.push( new FormControl( null, Validators.required ) );
    }

    this.editForm = new FormGroup({
      'name': new FormControl( conversationName, Validators.required ),
      'participants': participants
    });
  }

  onAddParticipant() {
    ( <FormArray> this.editForm.get( 'participants' ) ).push(
      new FormControl( null, Validators.required )
    );
  }

  onRemoveParticipant( index: number ) {
    ( <FormArray> this.editForm.get('participants') ).removeAt( index );
  }

  onSubmit() {
    const users = [];

    for ( const username of this.editForm.value.participants ) {
      users.push( new User( username ) );
    }

    const conversation = new Conversation( this.editForm.value.name, this.authService.getCurrentUser(), users );

    if ( this.editMode ) {
      conversation._id = this.editId;
      this.conversationService.updateConversation( this.editId, conversation );
    } else {
      this.conversationService.addConversation( conversation );
    }

    this.editForm.reset();
    this.router.navigate( ['/messenger'] );
  }

  onRemoveConversation() {
    if ( this.editMode ) {
      this.conversationService.removeConversation( this.editId );
      this.router.navigate( ['/messenger'] );
    }
  }
}
