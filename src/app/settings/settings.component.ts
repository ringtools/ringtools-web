import { Component, OnInit } from '@angular/core';
import { RingDataService } from '../services/ring-data.service';
import ringInfo from '../data/ring.txt';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { Observable } from 'rxjs';
import { loadCbNodeOwners } from '../actions/cb-node-owner.actions';
import { RingSetting } from '../model/ring-setting.model';
import { removeRingSetting, upsertRingSetting } from '../actions/ring-setting.actions';
import { selectRingSettings } from '../selectors/ring-setting.selectors';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  segments: CbNodeOwner[] | undefined;
  pubkeysText: any = '';
  ringName: any = '';
  pubsubServer: string = '';
  cbNodeOwners$: Observable<CbNodeOwner[]>;
  ringSettings$: Observable<RingSetting[]>;
  ringSettings: RingSetting[] = [];

  constructor(
    public ringData: RingDataService,
    private store: Store<fromRoot.State>
  ) {
    this.ringSettings$ = this.store.select(selectRingSettings);

    this.ringSettings$.subscribe((data) => {
      this.ringSettings = data;
    })

    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.cbNodeOwners$.subscribe((data) => {
      this.segments = data;
    })
    this.pubkeysText = ringInfo;
    this.ringName = ringData.getRingName();

    this.pubsubServer = this.ringData.getPubsubServer();
  }

  ngOnInit(): void {
  }

  getSegments() {
    return this.segments;
  }

  processPubkeys() {
    let segmentLines = this.pubkeysText.split('\n');
    let segments: any = [];
    for (let line of segmentLines) {
      segments.push(line.split(','));
    }

    this.ringData.setSegments(segments);
    this.ringData.repopulate();
  }

  processGroupnodes() {
    let segments = this.ringData.parseCsvToType(this.pubkeysText);
    this.store.dispatch(loadCbNodeOwners(segments))
  }

  processRingname() {

    this.ringData.setRingName(this.ringName);
  }

  saveRingSettings() {
    if (this.segments) {
      let ringSettings: RingSetting = {
        ringName: this.ringData.getRingName(),
        ringParticipants: this.segments,
        cleanRingName: this.ringData.getRingName().replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').substr(1),
        id: this.ringData.getRingName().replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').substr(1)
      }
      this.store.dispatch(upsertRingSetting({ ringSetting: ringSettings }))
    }
  }

  loadSettings(item) {
    this.ringData.loadSettings(item);
  }

  removeSettings(item) {
    this.store.dispatch(removeRingSetting({ ringSetting: item.cleanRingName }))
  }

  setPubSubServer() {

  }
}
