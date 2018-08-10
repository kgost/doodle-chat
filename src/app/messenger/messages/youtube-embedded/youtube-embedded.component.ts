import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

import { MessageService } from '../message.service';

@Component({
  selector: 'app-youtube-embedded',
  templateUrl: './youtube-embedded.component.html',
  styleUrls: ['./youtube-embedded.component.css']
})
export class YoutubeEmbeddedComponent implements OnInit {
  @Input() youtubeId;
  @ViewChild('frame') frame: ElementRef;

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
  }

  getHeight() {
    return this.frame.nativeElement.clientWidth * 0.5625;
  }
}
