import { createAction, props } from '@ngrx/store';
import { NodeOwner } from '../model/node_owner.model';

export const setSettings = createAction(
  '[Setting] Set Settings'
);

export const setRingName = createAction(
  '[Setting] set Ring Name',
  (ringName: string) => ({ringName})
);

export const setRingSize = createAction(
  '[Setting] set Ring Size',
  (ringSize: number) => ({ringSize})
);

export const setRingLeader = createAction(
  '[Setting] set Ring Leader',
  (ringLeader: NodeOwner) => ({ringLeader})
);

export const setViewMode = createAction(
  '[Setting] set View Mode',
  (viewMode: string) => ({viewMode})
);

export const setPubsubServer = createAction(
  '[Setting] set PubSub server',
  (pubsubServer: string) => ({pubsubServer})
);

export const setShowLogo = createAction(
  '[Setting] set Show Logo',
  (showLogo: boolean) => ({showLogo})
);


