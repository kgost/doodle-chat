import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

import { Poll } from './poll.model';
import { MessageService } from '../message.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit, AfterViewInit {
  @Input() poll: Poll;
  @Input() messageId: string;
  loaded = false;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.loaded = true;
    console.log( this.poll.answers[0] );
  }

  ngAfterViewInit() {
    this.messageService.loadEmitter.emit();
  }

  onVote( i ) {
    this.messageService.pollVote( this.poll, i, this.messageId );
  }

  inAnswer( answer: any ) {
    return answer.userIds.indexOf( this.authService.getCurrentUser()._id ) !== -1;
  }
}
