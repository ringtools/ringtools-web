import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromSetting from '../reducers/setting.reducer';

export const selectSettingState = createFeatureSelector<fromSetting.SettingState>(
    fromSetting.settingFeatureKey,
);

export const selectSettings = createSelector(
    selectSettingState,
   (state: fromSetting.SettingState) => state
)