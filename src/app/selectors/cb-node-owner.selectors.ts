import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCbNodeOwner from '../reducers/cb-node-owner.reducer';

export const selectCbNodeOwnersState = createFeatureSelector<fromCbNodeOwner.CbNodeOwnerState>(
    fromCbNodeOwner.cbNodeOwnerFeatureKey,
);

export const selectCbNodeOwners = createSelector(
    selectCbNodeOwnersState,
    fromCbNodeOwner.selectAllCbNodeOwners
   // (state: fromCbNodeOwner.CbNodeOwnerState) => state.cbNodeOwners
)