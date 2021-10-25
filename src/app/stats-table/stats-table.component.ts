import { Component, OnInit } from '@angular/core';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { RingDataService } from '../services/ring-data.service';
import * as fromRoot from '../reducers';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';

@Component({
  selector: 'app-stats-table',
  templateUrl: './stats-table.component.html',
  styleUrls: ['./stats-table.component.scss']
})
export class StatsTableComponent implements OnInit {
  segments: CbNodeOwner[] | undefined;
  cbNodeOwners$: Observable<CbNodeOwner[]>
  viewMode: string;
  pubkeysText = '';

  constructor(
    public ringData: RingDataService,
    private store: Store<fromRoot.State>

  ) { 
    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.cbNodeOwners$.subscribe((data) => {
      this.segments = data;
    })

    this.viewMode = ringData.getViewMode();
  }

  ngOnInit(): void {
  }

  getSegments() {
    return this.segments;
  }

  getChannels() {
    return this.ringData.getChannels();
  }

  getAlias(pubkey:string) {
    return this.ringData.getAliasByPubkey(pubkey);
  }

  getUsername(pubkey:string) {
    return this.ringData.getTgUserByPubkey(pubkey);
  }

  processPubkeys() {
    let segmentLines = this.pubkeysText.split('\n');
    let segments:any = [];
    for (let line of segmentLines) {
      segments.push(line.split(','));
    }

    this.ringData.setSegments(segments);
    this.ringData.repopulate();
    //console.log(segments);
  }

  processGroupnodes() {
    let segmentLines = this.pubkeysText.split('\n');
    let segments:any = [];
    for (let line of segmentLines.slice(1)) {
      let parts = line.split(',');
      segments.push([parts[2], parts[0]]);
    }

    console.log(segments);

    this.ringData.setSegments(segments);
    this.ringData.repopulate();
    //console.log(segments);
  }
}
