import { Component, Input } from '@angular/core';
import { NodeOwner } from '../model/node_owner.model';
import * as fromRoot from '../reducers';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectNodeOwners } from '../selectors/node-owner.selectors';
import { SettingState } from '../reducers/setting.reducer';
import { selectSettings } from '../selectors/setting.selectors';
import { colorScale, getUsername } from '../utils/utils';
import { NodeInfo } from '../model/node_info.model';

@Component({
  selector: 'app-stats-table',
  templateUrl: './stats-table.component.html',
  styleUrls: ['./stats-table.component.scss']
})
export class StatsTableComponent {
  @Input() participants;
  settings:SettingState;
  nodeOwners: NodeOwner[] = [];
  nodeOwners$: Observable<NodeOwner[]>

  constructor(
    private store: Store<fromRoot.State>,
  ) {
    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;
    });

    this.nodeOwners$ = this.store.pipe(select(selectNodeOwners));

    this.nodeOwners$.subscribe((data) => {
      this.nodeOwners = data;
    })
  }

  getColor(i) {
    return colorScale(i);;
  }

  getUsername(node: NodeInfo | undefined) {
    return getUsername(node, this.nodeOwners);
  }
}
