import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationEditComponent } from './conversation-edit.component';

describe('ConversationEditComponent', () => {
  let component: ConversationEditComponent;
  let fixture: ComponentFixture<ConversationEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
