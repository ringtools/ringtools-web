import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { RingSetting } from '../model/ring-setting.model';
import * as RingSettingActions from '../actions/ring-setting.actions';

export const ringSettingsFeatureKey = 'ringSettings';

export interface RingSettingState extends EntityState<RingSetting> {
  // additional entities state properties
}

export function selectCleanRingName(r: RingSetting): string {
  //In this case this would be optional since primary key is id
  return r.cleanRingName;
}

export const ringSettingAdapter: EntityAdapter<RingSetting> = createEntityAdapter<RingSetting>({
  selectId: selectCleanRingName
});

export const initialState: RingSettingState = ringSettingAdapter.getInitialState({
  
});

// const id: any = "testid"

// export const initialState = {
//   ...zeroState,
//   ids: [
//     ...zeroState.ids,
//     id
//   ],
//   entities: {
//     ...zeroState.entities,
//     [id]: {
//         id: id,
//         ringName: 'id',
//         cleanRingName: 'id',
//         ringParticipants: []
//     },
// },
// }


export const ringSettingReducer = createReducer(
  initialState,
  on(RingSettingActions.addRingSetting,
    (state, action) => ringSettingAdapter.addOne(action.ringSetting, state)
  ),
  on(RingSettingActions.upsertRingSetting,
    (state, action) => ringSettingAdapter.upsertOne(action.ringSetting, state)
  ),
  on(RingSettingActions.addRingSettings,
    (state, action) => ringSettingAdapter.addMany(action.ringSettings, state)
  ),
  on(RingSettingActions.upsertRingSettings,
    (state, action) => ringSettingAdapter.upsertMany(action.ringSettings, state)
  ),
  on(RingSettingActions.updateRingSetting,
    (state, action) => ringSettingAdapter.updateOne(action.ringSetting, state)
  ),
  on(RingSettingActions.updateRingSettings,
    (state, action) => ringSettingAdapter.updateMany(action.ringSettings, state)
  ),
  on(RingSettingActions.deleteRingSetting,
    (state, action) => ringSettingAdapter.removeOne(action.id, state)
  ),
  on(RingSettingActions.removeRingSetting,
    (state, action) => ringSettingAdapter.removeOne(action.ringSetting, state)
  ),
  on(RingSettingActions.deleteRingSettings,
    (state, action) => ringSettingAdapter.removeMany(action.ids, state)
  ),
  on(RingSettingActions.loadRingSettings,
    (state, action) => ringSettingAdapter.setAll(action.ringSettings, state)
  ),
  on(RingSettingActions.clearRingSettings,
    state => ringSettingAdapter.removeAll(state)
  ),
);


export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = ringSettingAdapter.getSelectors();

export const selectAllRingSettings = selectAll;

export function ringSettingFeatureKey<T>(ringSettingFeatureKey: any) {
    throw new Error('Function not implemented.');
}

export function reducer(state: RingSettingState | undefined, action: Action): any {
  return ringSettingReducer(state, action);
}