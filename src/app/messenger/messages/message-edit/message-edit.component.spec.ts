import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageEditComponent } from './message-edit.component';

describe('MessageEditComponent', () => {
  let component: MessageEditComponent;
  let fixture: ComponentFixture<MessageEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
