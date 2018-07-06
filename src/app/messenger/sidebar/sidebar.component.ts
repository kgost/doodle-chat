import { Component, OnInit } from '@angular/core';

import { SidebarService } from './sidebar.service';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(
    private sidebarService: SidebarService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.notificationService.loadNotifications();
  }
}
