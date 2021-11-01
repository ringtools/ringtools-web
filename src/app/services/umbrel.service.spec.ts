import { TestBed } from '@angular/core/testing';

import { UmbrelService } from './umbrel.service';

describe('UmbrelService', () => {
  let service: UmbrelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UmbrelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
