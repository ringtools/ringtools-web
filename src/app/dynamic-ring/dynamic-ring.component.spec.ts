import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicRingComponent } from './dynamic-ring.component';

describe('DynamicRingComponent', () => {
  let component: DynamicRingComponent;
  let fixture: ComponentFixture<DynamicRingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicRingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicRingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
