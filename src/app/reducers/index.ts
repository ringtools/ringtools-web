import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { localStorageSync, rehydrateApplicationState } from 'ngrx-store-localstorage';
import { environment } from '../../environments/environment';
import { nodeOwnerFeatureKey, nodeOwnerReducer } from './node-owner.reducer';
import { channelReducer } from './channel.reducer';
import { nodeInfoReducer } from './node-info.reducer';
import { ringSettingReducer, ringSettingsFeatureKey } from './ring-setting.reducer';
import { settingFeatureKey, settingReducer } from './setting.reducer';

export interface State {

}

export const reducers: ActionReducerMap<State> = {
  nodeOwner: nodeOwnerReducer,
  channel: channelReducer,
  nodeInfo: nodeInfoReducer,
  ringSettings: ringSettingReducer,
  setting: settingReducer
};

//let lsKeys = .map(k => environment.networkClass ? `${environment.networkClass}-${k}` : k);

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync(
    {
      keys: [ringSettingsFeatureKey, nodeOwnerFeatureKey, settingFeatureKey],
      rehydrate: true,
      storageKeySerializer: (k) => environment.networkClass ? `${environment.networkClass}.${k}` : k
    })(reducer);
}

export const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

//export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
