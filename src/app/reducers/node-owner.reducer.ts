import { Action, createReducer, on } from '@ngrx/store';
import { NodeOwner } from '../model/node_owner.model';
import * as NodeOwnerActions from '../actions/node-owner.actions';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

export const nodeOwnerFeatureKey = 'nodeOwner';

export interface NodeOwnerState extends EntityState<NodeOwner>  {
//  NodeOwners: NodeOwner[];
  pub_key: string | null
}

export function selectNodeOwner(a: NodeOwner): string {
  //In this case this would be optional since primary key is id
  return a.pub_key;
}

export function sortByUserName(a: NodeOwner, b: NodeOwner): number {
  return a.first_name.localeCompare(b.first_name);
}

export const adapter: EntityAdapter<NodeOwner> = createEntityAdapter<NodeOwner>({
  selectId: selectNodeOwner,
//  sortComparer: sortByUserName,
});

export const initialNodeOwnerState: NodeOwnerState = adapter.getInitialState({
  pub_key: ''
});


export const nodeOwnerReducer = createReducer(
  initialNodeOwnerState,
  on(NodeOwnerActions.addNodeOwner, 
    (state: NodeOwnerState, {NodeOwner}) => {
      return adapter.addOne(NodeOwner, state)
  }),
  on(NodeOwnerActions.addNodeOwners, 
    (state: NodeOwnerState, {NodeOwners}) => {
      return adapter.addMany(NodeOwners, state)
  }),
  on(NodeOwnerActions.loadNodeOwners, 
    (state: NodeOwnerState, {NodeOwners}) => {
      return adapter.setAll(NodeOwners, state)
  }),
  on(NodeOwnerActions.setNodeOwners, 
    (state: NodeOwnerState, {NodeOwners}) => {
      return adapter.setMany(NodeOwners, state)
  }),
  on(NodeOwnerActions.removeNodeOwner,
    (state: NodeOwnerState, {NodeOwner}) => {
      return adapter.removeOne(NodeOwner.pub_key, state)
    }),
  on(NodeOwnerActions.clearNodeOwners,
    state => {
      return adapter.removeAll({...state, selectNodeOwner: null })
    })
);

4
export function reducer(state: NodeOwnerState | undefined, action: Action): any {
  return nodeOwnerReducer(state, action);
}

// get the selectors
const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();


export const selectAllNodeOwners = selectAll;
