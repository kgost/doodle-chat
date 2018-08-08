import { Component, OnInit, Input } from '@angular/core';

import { Media } from './media.model';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {
  @Input() media: Media;
  loaded = false;

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.messageService.loadEmitter.emit();
    this.loaded = true;
  }

  loadEmit() {
    console.log( 'feff' );
    this.messageService.loadEmitter.emit();
  }
}
