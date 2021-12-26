import { Component, Input, OnInit } from '@angular/core';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { RingDataService } from '../services/ring-data.service';
import * as fromRoot from '../reducers';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { SettingState } from '../reducers/setting.reducer';
import { selectSettings } from '../selectors/setting.selectors';
import { colorScale, getUsername } from '../utils/utils';
import { NodeInfo } from '../model/node_info.model';
import { RingParticipant } from '../model/ring_participant.model';

@Component({
  selector: 'app-stats-table',
  templateUrl: './stats-table.component.html',
  styleUrls: ['./stats-table.component.scss']
})
export class StatsTableComponent {
  @Input() participants;
  settings:SettingState;
  cbNodeOwners: CbNodeOwner[] = [];
  cbNodeOwners$: Observable<CbNodeOwner[]>

  constructor(
    private store: Store<fromRoot.State>,
  ) {
    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;
    });

    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.cbNodeOwners$.subscribe((data) => {
      this.cbNodeOwners = data;
    })
  }

  getColor(i) {
    return colorScale(i);;
  }

  getUsername(node: NodeInfo | undefined) {
    return getUsername(node, this.cbNodeOwners);
  }
}
