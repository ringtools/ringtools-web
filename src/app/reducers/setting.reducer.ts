import { state } from '@angular/animations';
import { Action, createReducer, on } from '@ngrx/store';
import * as SettingActions from '../actions/setting.actions';


export const settingFeatureKey = 'setting';

export interface SettingState {
  ringName: string
  viewMode: string
  pubsubServer: string
  showLogo: boolean
}

export const initialState: SettingState = {
  ringName: '#SRROF_500Ksats_8thRING',
  viewMode: 'tg',
  pubsubServer: 'http://umbrel:5000',
  showLogo: false
};


export const settingReducer = createReducer(
  initialState,
  on(SettingActions.setRingName, 
    (state: SettingState, {ringName}) => {
      return {...state, ringName: ringName }
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
