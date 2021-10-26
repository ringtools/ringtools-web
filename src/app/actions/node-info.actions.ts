import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { NodeInfo } from '../model/node_info.model';

export const loadNodeInfos = createAction(
  '[NodeInfo/API] Load NodeInfos', 
  props<{ nodeInfos: NodeInfo[] }>()
);

export const addNodeInfo = createAction(
  '[NodeInfo/API] Add NodeInfo',
  props<{ nodeInfo: NodeInfo }>()
);

export const upsertNodeInfo = createAction(
  '[NodeInfo/API] Upsert NodeInfo',
  props<{ nodeInfo: NodeInfo }>()
);

export const addNodeInfos = createAction(
  '[NodeInfo/API] Add NodeInfos',
  props<{ nodeInfos: NodeInfo[] }>()
);

export const upsertNodeInfos = createAction(
  '[NodeInfo/API] Upsert NodeInfos',
  props<{ nodeInfos: NodeInfo[] }>()
);

export const updateNodeInfo = createAction(
  '[NodeInfo/API] Update NodeInfo',
  props<{ nodeInfo: Update<NodeInfo> }>()
);

export const updateNodeInfos = createAction(
  '[NodeInfo/API] Update NodeInfos',
  props<{ nodeInfos: Update<NodeInfo>[] }>()
);

export const deleteNodeInfo = createAction(
  '[NodeInfo/API] Delete NodeInfo',
  props<{ id: string }>()
);

export const deleteNodeInfos = createAction(
  '[NodeInfo/API] Delete NodeInfos',
  props<{ ids: string[] }>()
);

export const clearNodeInfos = createAction(
  '[NodeInfo/API] Clear NodeInfos'
);
