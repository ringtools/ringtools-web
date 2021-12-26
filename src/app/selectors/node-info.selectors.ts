import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromNodeInfo from '../reducers/node-info.reducer';

export const selectNodeInfoState = createFeatureSelector<fromNodeInfo.NodeInfoState>(
    fromNodeInfo.nodeInfoesFeatureKey,
);



// export const selectIds = createSelector(selectNodeInfos, (state) => state?.);
// export const selectEntities = createSelector(selectNodeInfos, (state) => state?.entities);
// export const selectAll = createSelector(selectNodeInfos, (state) => (state?.ids as Array<string|number>)?.map(id => state?.entities[id]));
// export const selectTotal = createSelector(selectNodeInfos, (state) => state?.ids?.length);

// export const selectAllNodeInfo = selectAll;

export const selectNodeInfos = createSelector(
    selectNodeInfoState,
    fromNodeInfo.selectAllNodeInfo
   // (state: fromCbNodeOwner.CbNodeOwnerState) => state.cbNodeOwners
)

export const selectNodeInfosPubkey = (props: { pub_key: string }) => createSelector(
    selectNodeInfoState,
   // fromNodeInfo.selectAllNodeInfoPubkey,
    (nodes) => nodes[props.pub_key]
   // (state: fromCbNodeOwner.CbNodeOwnerState) => state.cbNodeOwners
)


export const selectNodeByPubKey = pub_key => createSelector(
    selectNodeInfoState,
   // fromNodeInfo.selectAllNodeInfoPubkey,
    (entities) => { 
        return entities[pub_key]
    }
   // (state: fromCbNodeOwner.CbNodeOwnerState) => state.cbNodeOwners
)

//export const selectById = createSelector(selectEntities, selectBuildingId, (buildingsDic, id) => buildingsDic[id]);
