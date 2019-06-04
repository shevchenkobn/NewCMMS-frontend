import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTriggerHistoryComponent } from './user-trigger-history.component';

describe('UserTriggerHistoryComponent', () => {
  let component: UserTriggerHistoryComponent;
  let fixture: ComponentFixture<UserTriggerHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTriggerHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTriggerHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
