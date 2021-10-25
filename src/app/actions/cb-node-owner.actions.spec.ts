import * as fromCbNodeOwner from './cb-node-owner.actions';

describe('loadCbNodeOwners', () => {
  it('should return an action', () => {
    expect(fromCbNodeOwner.loadCbNodeOwners().type).toBe('[CbNodeOwner] Load CbNodeOwners');
  });
});
