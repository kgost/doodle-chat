import { Component, OnInit, Input } from '@angular/core';

import { AuthService } from '../../../auth/auth.service';
import { SidebarService } from '../../sidebar/sidebar.service';
import { Media } from './media.model';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {
  @Input() media: Media;

  constructor() { }

  ngOnInit() {
  }
}
