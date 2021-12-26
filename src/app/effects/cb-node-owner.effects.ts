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

  constructor(
    private actions$: Actions,
    private ringData: RingDataService,
    private store: Store<fromRoot.State>,
  ) {}

}
