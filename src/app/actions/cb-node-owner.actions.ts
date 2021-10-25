import { createAction, props } from '@ngrx/store';
import { CbNodeOwner } from '../model/cb_node_owner.model';



export const addCbNodeOwner = createAction(
  '[CbNodeOwner] Add CbNodeOwner',
  (cbNodeOwner: CbNodeOwner) => ({cbNodeOwner})
);

export const addCbNodeOwners = createAction(
  '[CbNodeOwner] Add CbNodeOwners',
  (cbNodeOwners: CbNodeOwner[]) => ({cbNodeOwners})
);

export const loadCbNodeOwners = createAction(
  '[CbNodeOwner] Load CbNodeOwners',
  (cbNodeOwners: CbNodeOwner[]) => ({cbNodeOwners})
);

export const setCbNodeOwners = createAction(
  '[CbNodeOwner] Set CbNodeOwners',
  (cbNodeOwners: CbNodeOwner[]) => ({cbNodeOwners})
);

export const clearCbNodeOwners = createAction(
  '[CbNodeOwner] Clear CbNodeOwners'
);


