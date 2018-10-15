import { Component, OnInit, Input } from '@angular/core';

import { Media } from '../media/media.model';

import { MessageService } from '../message.service';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css']
})
export class ImagePreviewComponent implements OnInit {
  @Input() media: Media;

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
  }

  onClose() {
    this.messageService.previewSubject.next( null );
  }
}
