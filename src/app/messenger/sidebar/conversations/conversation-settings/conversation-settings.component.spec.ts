import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationSettingsComponent } from './conversation-settings.component';

describe('ConversationSettingsComponent', () => {
  let component: ConversationSettingsComponent;
  let fixture: ComponentFixture<ConversationSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
