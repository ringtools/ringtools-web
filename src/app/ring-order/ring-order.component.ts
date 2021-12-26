import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { DragulaService } from 'ng2-dragula';
import { Observable, Subscription } from 'rxjs';
import { loadCbNodeOwners } from '../actions/cb-node-owner.actions';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { NodeInfo } from '../model/node_info.model';
import { RingSetting } from '../model/ring-setting.model';
import * as fromRoot from '../reducers';
import { SettingState } from '../reducers/setting.reducer';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { selectRingSettings } from '../selectors/ring-setting.selectors';
import { selectSettings } from '../selectors/setting.selectors';
import { RingDataService } from '../services/ring-data.service';
import { ToastService } from '../toast/toast.service';
import { getUsername } from '../utils/utils';


@Component({
  selector: 'app-ring-order',
  templateUrl: './ring-order.component.html',
  styleUrls: ['./ring-order.component.scss']
})
export class RingOrderComponent implements OnInit, OnDestroy {
  cbNodeOwners: CbNodeOwner[] = [];
  cbNodeOwners$: Observable<CbNodeOwner[]>;

  Participants = 'PARTICIPANTS'
  viewMode!: string;
  participants: any;
  settings:SettingState;
  currentNodeInfo: any;
  subs = new Subscription();
  ringSettings$: Observable<RingSetting[]>;
  ringSettings: RingSetting;

  constructor(
    private ringData: RingDataService,
    private store: Store<fromRoot.State>,
    private toastService: ToastService,
    private dragulaService: DragulaService,
  ) {
    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.cbNodeOwners$.subscribe((data) => {
      this.cbNodeOwners = data;
    })

    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;
    });

    this.ringSettings$ = this.store.select(selectRingSettings);

    // this.ringSettings$.subscribe((data) => {
    //   this.ringSettings = data;
    // })

    this.viewMode = ringData.getViewMode();

    dragulaService.createGroup("PARTICIPANTS", {
      removeOnSpill: true
    });
  }

  ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.dragulaService.destroy('PARTICIPANTS');
  }

  getCbUsername(nodeOwner: CbNodeOwner) {
    if (nodeOwner.handle == 'None') {
      return nodeOwner.user_name;
    }
    return `${nodeOwner.user_name} (@${nodeOwner.handle})`;
  }
}
