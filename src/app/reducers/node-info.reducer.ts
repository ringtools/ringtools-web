import { Action, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as NodeInfoActions from '../actions/node-info.actions';
import { NodeInfo } from '../model/node_info.model';
import { channelAdapter, ChannelState } from './channel.reducer';

export const nodeInfoesFeatureKey = 'nodeInfoes';

export interface NodeInfoState extends EntityState<NodeInfo> {
  
  node: { pub_key: string | null },
  channels: ChannelState
}

export function selectNodeInfoId(a: NodeInfo): string {
  //In this case this would be optional since primary key is id
  return a.node ? a.node.pub_key : '';
}


export const adapter: EntityAdapter<NodeInfo> = createEntityAdapter<NodeInfo>({
  selectId: selectNodeInfoId,
});

export const initialState: NodeInfoState = adapter.getInitialState({
  node: { pub_key: null },
  id: null,
  channels: channelAdapter.getInitialState()
});


export const nodeInfoReducer = createReducer(
  initialState,
  on(NodeInfoActions.addNodeInfo,
    (state, action) => adapter.addOne(action.nodeInfo, state)
  ),
  on(NodeInfoActions.upsertNodeInfo,
    (state, action) => adapter.upsertOne(action.nodeInfo, state)
  ),
  on(NodeInfoActions.addNodeInfos,
    (state, action) => adapter.addMany(action.nodeInfos, state)
  ),
  on(NodeInfoActions.upsertNodeInfos,
    (state, action) => adapter.upsertMany(action.nodeInfos, state)
  ),
  on(NodeInfoActions.updateNodeInfo,
    (state, action) => adapter.updateOne(action.nodeInfo, state)
  ),
  on(NodeInfoActions.updateNodeInfos,
    (state, action) => adapter.updateMany(action.nodeInfos, state)
  ),
  on(NodeInfoActions.deleteNodeInfo,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(NodeInfoActions.deleteNodeInfos,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(NodeInfoActions.loadNodeInfos,
    (state, action) => adapter.setAll(action.nodeInfos, state)
  ),
  on(NodeInfoActions.clearNodeInfos,
    state => adapter.removeAll(state)
  ),
);

export function reducer(state: NodeInfoState | undefined, action: Action): any {
  return nodeInfoReducer(state, action);
}

export const getSelectedNodeInfoPubKey = (state: NodeInfoState) => state?.node.pub_key;


export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

// export const selectNodeInfoState = createFeatureSelector<NodeInfoState>(
//   nodeInfoesFeatureKey,
// );


// export const selectIds = createSelector(selectNodeInfoState, (state) => state?.node.pub_key);
// export const selectEntities = createSelector(selectNodeInfoState, (state) => state?.entities);
// export const selectAll = createSelector(selectNodeInfoState, (state) => (state?.ids as Array<string|number>)?.map(id => state?.entities[id]));
// export const selectTotal = createSelector(selectNodeInfoState, (state) => state?.node.pub_key?.length);

export const selectAllNodeInfoPubkey = selectIds;
export const selectAllNodeInfo = selectAll;
