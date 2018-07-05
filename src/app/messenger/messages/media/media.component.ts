import { Component, OnInit, AfterViewInit, Input } from '@angular/core';

import { Media } from './media.model';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit, AfterViewInit {
  @Input() media: Media;

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.messageService.loadEmitter.emit();
  }

  loadEmit() {
  }
}
