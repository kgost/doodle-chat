import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSoundComponent } from './notification-sound.component';

describe('NotificationSoundComponent', () => {
  let component: NotificationSoundComponent;
  let fixture: ComponentFixture<NotificationSoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationSoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationSoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
