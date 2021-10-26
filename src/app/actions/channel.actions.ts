import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ChannelEdge } from '../model/channel_edge.model';

export const loadChannels = createAction(
  '[ChannelEdge/API] Load ChannelEdges', 
  props<{ channels: ChannelEdge[] }>()
);

export const addChannel = createAction(
  '[ChannelEdge/API] Add ChannelEdge',
  props<{ channel: ChannelEdge }>()
);

export const upsertChannel = createAction(
  '[ChannelEdge/API] Upsert ChannelEdge',
  props<{ channel: ChannelEdge }>()
);

export const addChannels = createAction(
  '[ChannelEdge/API] Add ChannelEdges',
  props<{ channels: ChannelEdge[] }>()
);

export const upsertChannels = createAction(
  '[ChannelEdge/API] Upsert ChannelEdges',
  props<{ channels: ChannelEdge[] }>()
);

export const updateChannel = createAction(
  '[ChannelEdge/API] Update ChannelEdge',
  props<{ channel: Update<ChannelEdge> }>()
);

export const updateChannels = createAction(
  '[ChannelEdge/API] Update ChannelEdges',
  props<{ channels: Update<ChannelEdge>[] }>()
);

export const deleteChannel = createAction(
  '[ChannelEdge/API] Delete ChannelEdge',
  props<{ id: string }>()
);

export const deleteChannels = createAction(
  '[ChannelEdge/API] Delete ChannelEdges',
  props<{ ids: string[] }>()
);

export const clearChannels = createAction(
  '[ChannelEdge/API] Clear ChannelEdges'
);
