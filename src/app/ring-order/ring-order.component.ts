import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { DragulaService } from 'ng2-dragula';
import { Observable, Subscription } from 'rxjs';
import { loadNodeOwners } from '../actions/node-owner.actions';
import { NodeOwner } from '../model/node_owner.model';
import { RingSetting } from '../model/ring-setting.model';
import * as fromRoot from '../reducers';
import { SettingState } from '../reducers/setting.reducer';
import { selectNodeOwners } from '../selectors/node-owner.selectors';
import { selectRingSettings } from '../selectors/ring-setting.selectors';
import { selectSettings } from '../selectors/setting.selectors';
import { RingDataService } from '../services/ring-data.service';
import { ToastService } from '../toast/toast.service';


@Component({
  selector: 'app-ring-order',
  templateUrl: './ring-order.component.html',
  styleUrls: ['./ring-order.component.scss']
})
export class RingOrderComponent implements OnInit, OnDestroy {
  nodeOwners: NodeOwner[] = [];
  nodeOwners$: Observable<NodeOwner[]>;

  Participants = 'PARTICIPANTS'
  viewMode!: string;
  participants: any;
  settings:SettingState;
  currentNodeInfo: any;
  subs = new Subscription();
  ringSettings$: Observable<RingSetting[]>;
  ringSettings: RingSetting;

  constructor(
    private store: Store<fromRoot.State>,
    private toastService: ToastService,
    private dragulaService: DragulaService,
    private ringData: RingDataService
  ) {
    this.nodeOwners$ = this.store.pipe(select(selectNodeOwners));

    this.nodeOwners$.subscribe((data) => {
      this.nodeOwners = data;
    })

    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;
      this.viewMode  = settings.viewMode;
    });

    this.ringSettings$ = this.store.select(selectRingSettings);

    dragulaService.createGroup("PARTICIPANTS", {
      removeOnSpill: true
    });

    this.ringData.currentAction.subscribe(action => {
      if (action == 'persistOrder') this.persistOrder();
    })
  }

  ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.dragulaService.destroy('PARTICIPANTS');
  }

  getCbUsername(nodeOwner: NodeOwner) {
    if (nodeOwner.username == 'None') {
      return nodeOwner.first_name;
    }
    return `${nodeOwner.first_name} (@${nodeOwner.username})`;
  }

  persistOrder() {
    try {
      this.store.dispatch(loadNodeOwners(this.nodeOwners))
      this.ringData.saveRingSettings(this.nodeOwners);
      this.toastService.show('Node order persisted', { classname: 'bg-success' });
    } catch (e) {
      this.toastService.show('Error persisting order', { classname: 'bg-danger' });
    }
  }
}
