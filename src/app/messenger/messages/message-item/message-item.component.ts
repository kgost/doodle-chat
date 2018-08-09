import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Message } from '../message.model';
import { MessageService } from '../message.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.css']
})
export class MessageItemComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input()message: Message;
  @ViewChild('clearfix') clearfix: ElementRef;
  subscriptions: Subscription[] = [];
  owner = false;
  key = '';
  editReaction = false;
  showOptions = false;
  pressTimer: any;

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.owner = this.authService.getCurrentUser()._id === this.message.user;
    this.key = this.messageService.getKey();
    this.subscriptions.push( this.messageService.keyEmitter
      .subscribe(
        () => this.key = this.messageService.getKey()
      ));

    this.subscriptions.push( this.messageService.contextEmitter
      .subscribe(
        () => this.showOptions = false
      ));
  }

  onEdit() {
    this.messageService.editChange.next( this.message );
    this.onCloseOptions();
  }

  onDelete() {
    this.messageService.removeMessage( this.message._id );
    this.onCloseOptions();
  }

  onCheckReactions() {
    this.messageService.showReactions.next( this.message.reactions );
  }

  toggleReaction() {
    this.editReaction = !this.editReaction;
  }

  onSelectEmoji( emoji: string ) {
    this.messageService.addReaction( this.message._id,
      this.authService.encryptAes( unescape( encodeURIComponent( emoji ) ), this.messageService.getKey() ) );
    this.toggleReaction();
  }

  getDate() {
    let date;
    let dateString = '';

    if ( this.message.createdAt === this.message.updatedAt ) {
      date = this.message.createdAt;
    } else {
      date = this.message.createdAt;
      dateString = ' edited';
    }

    date = new Date( date );

    let time = date.toLocaleTimeString();
    time = time.substr( 0, time.length - 6 ) + ' ' + time.substr( time.length - 2, time.length );
    let dd;
    let mm;

    if ( date.getDate() !== new Date().getDate() ) {
      dd = date.getDate();
      mm = date.getMonth();

      if ( dd < 10 ) {
        dd = '0' + dd;
      }

      if ( mm < 10 ) {
        mm = '0' + ( mm + 1 );
      }

      dateString = `${ mm }/${ dd }, ${ time }${ dateString }`;
    } else {
      dateString = time + dateString;
    }

    return dateString;
  }

  onPress( event ) {
    this.messageService.contextEmitter.emit();
    this.showOptions = true;
    return false;
  }

  onCloseOptions() {
    this.showOptions = false;
  }

  ngAfterViewInit() {
    if ( !this.message.media && !this.message.poll ) {
      this.messageService.loadEmitter.emit();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
