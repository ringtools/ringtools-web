import { TestBed } from '@angular/core/testing';

import { RingDataService } from './ring-data.service';

describe('RingDataService', () => {
  let service: RingDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RingDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
