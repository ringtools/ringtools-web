import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RofCircleComponent } from './rof-circle.component';

describe('RofCircleComponent', () => {
  let component: RofCircleComponent;
  let fixture: ComponentFixture<RofCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RofCircleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RofCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
