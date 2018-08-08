import { Component, OnInit, Input } from '@angular/core';

import { Poll } from './poll.model';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit {
  @Input() poll: Poll;
  loaded = false;

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.messageService.loadEmitter.emit();
    this.loaded = true;
  }

  onVote( i ) {
    console.log( i );
  }
}
