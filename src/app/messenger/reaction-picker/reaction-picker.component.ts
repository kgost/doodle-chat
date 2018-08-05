import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-reaction-picker',
  templateUrl: './reaction-picker.component.html',
  styleUrls: ['./reaction-picker.component.css']
})
export class ReactionPickerComponent implements OnInit {
  @Output() emitEmoji = new EventEmitter<string>();
  emojis = ['🤔', '😂', '😍', '😤', '😢', '👍'];

  constructor() { }

  ngOnInit() {
  }

  onSelectEmoji( i: number ) {
    this.emitEmoji.emit( this.emojis[i] );
  }
}
