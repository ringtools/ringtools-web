import { createAction, props } from '@ngrx/store';

export const setSettings = createAction(
  '[Setting] Set Settings'
);

export const setRingName = createAction(
  '[Setting] set Ring Name',
  (ringName: string) => ({ringName})
);

export const setViewMode = createAction(
  '[Setting] set View Mode',
  (viewMode: string) => ({viewMode})
);

export const setPubsubServer = createAction(
  '[Setting] set PubSub server',
  (pubsubServer: string) => ({pubsubServer})
);


