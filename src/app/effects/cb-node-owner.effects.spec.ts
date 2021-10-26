import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { CbNodeOwnerEffects } from './cb-node-owner.effects';

describe('CbNodeOwnerEffects', () => {
  let actions$: Observable<any>;
  let effects: CbNodeOwnerEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CbNodeOwnerEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(CbNodeOwnerEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
