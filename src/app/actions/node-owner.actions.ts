import { createAction, props } from '@ngrx/store';
import { NodeOwner } from '../model/node_owner.model';



export const addNodeOwner = createAction(
  '[NodeOwner] Add NodeOwner',
  (NodeOwner: NodeOwner) => ({NodeOwner})
);

export const addNodeOwners = createAction(
  '[NodeOwner] Add NodeOwners',
  (NodeOwners: NodeOwner[]) => ({NodeOwners})
);

export const loadNodeOwners = createAction(
  '[NodeOwner] Load NodeOwners',
  (NodeOwners: NodeOwner[]) => ({NodeOwners})
);

export const removeNodeOwner = createAction(
  '[NodeOwner] Remove NodeOwner',
  (NodeOwner: NodeOwner) => ({NodeOwner})
);

export const setNodeOwners = createAction(
  '[NodeOwner] Set NodeOwners',
  (NodeOwners: NodeOwner[]) => ({NodeOwners})
);

export const clearNodeOwners = createAction(
  '[NodeOwner] Clear NodeOwners'
);


