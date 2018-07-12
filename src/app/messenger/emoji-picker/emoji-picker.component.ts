import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.css']
})
export class EmojiPickerComponent implements OnInit {
  @Output() emitEmoji = new EventEmitter<string>();
  emojis = ['🤔', '😂', '😍', '😤', '😢', '🇮🇪'];

  constructor() { }

  ngOnInit() {
  }

  onSelectEmoji( i: number ) {
    this.emitEmoji.emit( this.emojis[i] );
  }
}
