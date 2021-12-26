import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromNodeOwner from '../reducers/node-owner.reducer';

export const selectNodeOwnersState = createFeatureSelector<fromNodeOwner.NodeOwnerState>(
    fromNodeOwner.nodeOwnerFeatureKey,
);

export const selectNodeOwners = createSelector(
    selectNodeOwnersState,
    fromNodeOwner.selectAllNodeOwners
   // (state: fromNodeOwner.NodeOwnerState) => state.NodeOwners
)