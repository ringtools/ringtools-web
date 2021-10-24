import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatcherComponent } from './watcher.component';

describe('WatcherComponent', () => {
  let component: WatcherComponent;
  let fixture: ComponentFixture<WatcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WatcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
