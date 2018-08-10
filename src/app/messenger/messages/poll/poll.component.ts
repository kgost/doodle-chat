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

  progressX( index: number ) {
    let count = 0;

    for ( let i = 0; i < this.poll.answers.length; i++ ) {
      count += this.poll.answers[i].userIds.length;
    }

    if ( count === 0 ) {
      return '0%';
    }

    return this.poll.answers[index].userIds.length / count * 100 + '%';
  }
}
