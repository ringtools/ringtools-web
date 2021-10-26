import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { map, switchMap, tap } from 'rxjs';
import { loadCbNodeOwners } from '../actions/cb-node-owner.actions';
import { upsertChannel } from '../actions/channel.actions';
import { upsertNodeInfo } from '../actions/node-info.actions';
import { upsertRingSetting } from '../actions/ring-setting.actions';
import * as fromRoot from '../reducers';
import { RingDataService } from '../services/ring-data.service';


@Injectable()
export class CbNodeOwnerEffects {

  // updateNodes = createEffect(() => this.actions$.pipe(
  //   ofType(loadCbNodeOwners),
  //   tap(action => {
  //     // return action.cbNodeOwners.map((a) => {
  //     //   this.ringData.getNodeInfo(a.pub_key).pipe(
  //     //     map(node => { console.log(node )})
  //     //   )
  //     return action.cbNodeOwners.map((a) => {
  //       return this.ringData.getNodeInfo(a.pub_key).subscribe((data) => {
  //         return upsertNodeInfo({ nodeInfo: data });
  //       })
  //     })
  //   })
  // ), { dispatch: false })


  afterNodeUpdate = createEffect(() => this.actions$.pipe(
    ofType(upsertNodeInfo),
    tap(action => {
      console.log(action);
    })
  ), { dispatch: false })

  afterChannelUpdate = createEffect(() => this.actions$.pipe(
    ofType(upsertChannel),
    tap(action => {
      console.log(action);
    })
  ), { dispatch: false })

  afterRingSetting = createEffect(() => this.actions$.pipe(
    ofType(upsertRingSetting),
    tap(action => {
      console.log(action);
    })
  ), { dispatch: false })

  constructor(
    private actions$: Actions,
    private ringData: RingDataService,
    private store: Store<fromRoot.State>,
  ) {}

}
