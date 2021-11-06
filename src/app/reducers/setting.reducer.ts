import { state } from '@angular/animations';
import { Action, createReducer, on } from '@ngrx/store';
import * as SettingActions from '../actions/setting.actions';
import { CbNodeOwner } from '../model/cb_node_owner.model';


export const settingFeatureKey = 'setting';

export interface SettingState {
  ringName: string
  viewMode: string
  pubsubServer: string
  showLogo: boolean
  ringSize: number;
  ringLeader?: CbNodeOwner;
}

export const initialState: SettingState = {
  ringName: 'Loading...',
  viewMode: 'tg',
  pubsubServer: 'https://ringtools.djuri.nl',
  showLogo: false,
  ringSize: null
};


export const settingReducer = createReducer(
  initialState,
  on(SettingActions.setRingName, 
    (state: SettingState, {ringName}) => {
      return {...state, ringName: ringName }
  }),
  on(SettingActions.setRingLeader, 
    (state: SettingState, {ringLeader}) => {
      return {...state, ringLeader: ringLeader }
  }),
  on(SettingActions.setRingSize, 
    (state: SettingState, {ringSize}) => {
      return {...state, ringSize: ringSize }
  }),
  on(SettingActions.setViewMode, 
    (state: SettingState, {viewMode}) => {
      return {...state, viewMode: viewMode }
  }),
  on(SettingActions.setShowLogo, 
    (state: SettingState, {showLogo}) => {
      return {...state, showLogo: showLogo }
  }),
);

export function reducer(state: SettingState | undefined, action: Action): any {
  return settingReducer(state, action);
}
