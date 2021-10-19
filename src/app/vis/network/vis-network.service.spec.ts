import { TestBed } from '@angular/core/testing';

import { VisNetworkService } from './vis-network.service';

describe('VisNetworkService', () => {
  let service: VisNetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisNetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
