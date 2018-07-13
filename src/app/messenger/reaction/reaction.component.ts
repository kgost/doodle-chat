import { Component, OnInit, Input } from '@angular/core';

import { SidebarService } from '../sidebar/sidebar.service';
import { MessageService } from '../messages/message.service';

@Component({
  selector: 'app-reaction',
  templateUrl: './reaction.component.html',
  styleUrls: ['./reaction.component.css']
})
export class ReactionComponent implements OnInit {
  @Input() reactions: { text: string, username: string }[];
  key: string;

  constructor(
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.key = this.messageService.getKey();
  }

  onClose() {
    this.messageService.showReactions.next( null );
  }
}
