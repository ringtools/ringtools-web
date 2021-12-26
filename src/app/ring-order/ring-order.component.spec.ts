import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RingOrderComponent } from './ring-order.component';

describe('RingOrderComponent', () => {
  let component: RingOrderComponent;
  let fixture: ComponentFixture<RingOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RingOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RingOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
