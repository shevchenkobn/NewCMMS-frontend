import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillRateListComponent } from './bill-rate-list.component';

describe('BillRateListComponent', () => {
  let component: BillRateListComponent;
  let fixture: ComponentFixture<BillRateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillRateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillRateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
