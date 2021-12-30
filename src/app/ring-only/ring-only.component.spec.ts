import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RingOnlyComponent } from './ring-only.component';

describe('RingOnlyComponent', () => {
  let component: RingOnlyComponent;
  let fixture: ComponentFixture<RingOnlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RingOnlyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RingOnlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
