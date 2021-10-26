import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import { cbNodeReducer } from './cb-node-owner.reducer';
import { channelReducer } from './channel.reducer';
import { nodeInfoReducer } from './node-info.reducer';


export interface State {

}

export const reducers: ActionReducerMap<State> = {
  cbNodeOwner: cbNodeReducer,
  channel: channelReducer,
  nodeInfo: nodeInfoReducer
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
