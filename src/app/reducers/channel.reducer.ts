import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as ChannelActions from '../actions/channel.actions';
import { ChannelEdge } from '../model/channel_edge.model';

export const channelsFeatureKey = 'channels';

export interface ChannelState extends EntityState<ChannelEdge> {
  // additional entities state properties
}

export function selectChannelEdge(a: ChannelEdge): number {
  //In this case this would be optional since primary key is id
  return a.channel_id ? a.channel_id : -1;
}

export const channelAdapter: EntityAdapter<ChannelEdge> = createEntityAdapter<ChannelEdge>({
  selectId: selectChannelEdge
});

export const initialState: ChannelState = channelAdapter.getInitialState({
  selectId: selectChannelEdge,
});


export const channelReducer = createReducer(
  initialState,
  on(ChannelActions.addChannel,
    (state, action) => channelAdapter.addOne(action.channel, state)
  ),
  on(ChannelActions.upsertChannel,
    (state, action) => channelAdapter.upsertOne(action.channel, state)
  ),
  on(ChannelActions.addChannels,
    (state, action) => channelAdapter.addMany(action.channels, state)
  ),
  on(ChannelActions.upsertChannels,
    (state, action) => channelAdapter.upsertMany(action.channels, state)
  ),
  on(ChannelActions.updateChannel,
    (state, action) => channelAdapter.updateOne(action.channel, state)
  ),
  on(ChannelActions.updateChannels,
    (state, action) => channelAdapter.updateMany(action.channels, state)
  ),
  on(ChannelActions.deleteChannel,
    (state, action) => channelAdapter.removeOne(action.id, state)
  ),
  on(ChannelActions.deleteChannels,
    (state, action) => channelAdapter.removeMany(action.ids, state)
  ),
  on(ChannelActions.loadChannels,
    (state, action) => channelAdapter.setAll(action.channels, state)
  ),
  on(ChannelActions.clearChannels,
    state => channelAdapter.removeAll(state)
  ),
);

export function reducer(state: ChannelState | undefined, action: Action): any {
  return channelReducer(state, action);
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = channelAdapter.getSelectors();
