import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRingSetting from '../reducers/ring-setting.reducer';

export const selectRingSettingState = createFeatureSelector<fromRingSetting.RingSettingState>(
    fromRingSetting.ringSettingsFeatureKey,
);

export const selectRingSettings = createSelector(
    selectRingSettingState,
    fromRingSetting.selectAllRingSettings
)