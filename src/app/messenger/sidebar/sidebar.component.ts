import { Component, OnInit } from '@angular/core';

import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(
    private sidebarService: SidebarService
  ) { }

  ngOnInit() {
  }

}
