import { Action, createReducer, on } from '@ngrx/store';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import * as CbNodeOwnerActions from '../actions/cb-node-owner.actions';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

export const cbNodeOwnerFeatureKey = 'cbNodeOwner';

export interface CbNodeOwnerState extends EntityState<CbNodeOwner>  {
//  cbNodeOwners: CbNodeOwner[];
  pub_key: string | null
}

export function selectCbNodeOwner(a: CbNodeOwner): string {
  //In this case this would be optional since primary key is id
  return a.pub_key;
}

export function sortByUserName(a: CbNodeOwner, b: CbNodeOwner): number {
  return a.user_name.localeCompare(b.user_name);
}

export const adapter: EntityAdapter<CbNodeOwner> = createEntityAdapter<CbNodeOwner>({
  selectId: selectCbNodeOwner,
//  sortComparer: sortByUserName,
});

export const initialState: CbNodeOwnerState = adapter.getInitialState({
  pub_key: null
});


export const cbNodeReducer = createReducer(
  initialState,
  on(CbNodeOwnerActions.addCbNodeOwner, 
    (state: CbNodeOwnerState, {cbNodeOwner}) => {
      return adapter.addOne(cbNodeOwner, state)
  }),
  on(CbNodeOwnerActions.addCbNodeOwners, 
    (state: CbNodeOwnerState, {cbNodeOwners}) => {
      return adapter.addMany(cbNodeOwners, state)
  }),
  on(CbNodeOwnerActions.loadCbNodeOwners, 
    (state: CbNodeOwnerState, {cbNodeOwners}) => {
      return adapter.setAll(cbNodeOwners, state)
  }),
  on(CbNodeOwnerActions.setCbNodeOwners, 
    (state: CbNodeOwnerState, {cbNodeOwners}) => {
      return adapter.setMany(cbNodeOwners, state)
  }),
  on(CbNodeOwnerActions.clearCbNodeOwners,
    state => {
      return adapter.removeAll({...state, selectCbNodeOwner: null })
    })
);

4
export function reducer(state: CbNodeOwnerState | undefined, action: Action): any {
  return cbNodeReducer(state, action);
}

// get the selectors
const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();


export const selectAllCbNodeOwners = selectAll;
