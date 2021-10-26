import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { RingSetting } from '../model/ring-setting.model';

export const loadRingSettings = createAction(
  '[RingSetting/API] Load RingSettings', 
  props<{ ringSettings: RingSetting[] }>()
);

export const addRingSetting = createAction(
  '[RingSetting/API] Add RingSetting',
  props<{ ringSetting: RingSetting }>()
);

export const removeRingSetting = createAction(
  '[RingSetting/API] Remove RingSetting',
  props<{ ringSetting: string }>()
);

export const upsertRingSetting = createAction(
  '[RingSetting/API] Upsert RingSetting',
  props<{ ringSetting: RingSetting }>()
);

export const addRingSettings = createAction(
  '[RingSetting/API] Add RingSettings',
  props<{ ringSettings: RingSetting[] }>()
);

export const upsertRingSettings = createAction(
  '[RingSetting/API] Upsert RingSettings',
  props<{ ringSettings: RingSetting[] }>()
);

export const updateRingSetting = createAction(
  '[RingSetting/API] Update RingSetting',
  props<{ ringSetting: Update<RingSetting> }>()
);

export const updateRingSettings = createAction(
  '[RingSetting/API] Update RingSettings',
  props<{ ringSettings: Update<RingSetting>[] }>()
);

export const deleteRingSetting = createAction(
  '[RingSetting/API] Delete RingSetting',
  props<{ id: string }>()
);

export const deleteRingSettings = createAction(
  '[RingSetting/API] Delete RingSettings',
  props<{ ids: string[] }>()
);

export const clearRingSettings = createAction(
  '[RingSetting/API] Clear RingSettings'
);
