import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeEmbeddedComponent } from './youtube-embedded.component';

describe('YoutubeEmbeddedComponent', () => {
  let component: YoutubeEmbeddedComponent;
  let fixture: ComponentFixture<YoutubeEmbeddedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YoutubeEmbeddedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoutubeEmbeddedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
