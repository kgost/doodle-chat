import { Component, OnInit } from '@angular/core';

import { Favicons } from '../favicons';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  constructor(
    private favicons: Favicons
  ) { }

  ngOnInit() {
    this.favicons.activate( 'inactive' );
  }

}
