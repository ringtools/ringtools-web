import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import { cbNodeReducer } from './cb-node-owner.reducer';


export interface State {

}

export const reducers: ActionReducerMap<State> = {
  cbNodeOwner: cbNodeReducer
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
