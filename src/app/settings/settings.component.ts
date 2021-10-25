import { Component, OnInit } from '@angular/core';
import { RingDataService } from '../services/ring-data.service';
import ringInfo from '../data/ring.txt';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  segments: CbNodeOwner[] | undefined;
  pubkeysText:any = '';
  ringName:any = '';
  cbNodeOwners$: Observable<CbNodeOwner[]>;

  constructor(
    public ringData: RingDataService,
    private store: Store<fromRoot.State>
  ) {
    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));
    
    this.cbNodeOwners$.subscribe((data) => {
      this.segments = data;
    })
    this.pubkeysText = ringInfo;
    this.ringName = ringData.getRingName();
   }

  ngOnInit(): void {
  }

  getSegments() {
    return this.segments;
  }

  processPubkeys() {
    let segmentLines = this.pubkeysText.split('\n');
    let segments:any = [];
    for (let line of segmentLines) {
      segments.push(line.split(','));
    }

    this.ringData.setSegments(segments);
    this.ringData.repopulate();
  }

  processGroupnodes() {
    let segments = this.ringData.parseCsvToType(this.pubkeysText);
    this.ringData.setSegments(segments);
    this.ringData.repopulate();
  }

  processRingname() {

    this.ringData.setRingName(this.ringName);
  }
}
