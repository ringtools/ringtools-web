import { Component, OnInit } from '@angular/core';
import { RingDataService } from '../services/ring-data.service';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { Observable } from 'rxjs';
import { addCbNodeOwner, loadCbNodeOwners, removeCbNodeOwner } from '../actions/cb-node-owner.actions';
import { RingSetting } from '../model/ring-setting.model';
import { removeRingSetting, upsertRingSetting } from '../actions/ring-setting.actions';
import { selectRingSettings } from '../selectors/ring-setting.selectors';
import { selectSettings } from '../selectors/setting.selectors';
import { SettingState } from '../reducers/setting.reducer';
import { setShowLogo } from '../actions/setting.actions';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  segments: CbNodeOwner[] | undefined;
  pubkeysText: any = '';
  ringName: any = '';
  ringSize:number;
  pubsubServer: string = '';
  cbNodeOwners$: Observable<CbNodeOwner[]>;
  ringSettings$: Observable<RingSetting[]>;
  ringSettings: RingSetting[] = [];
  tempNodename = '';
  showLogo:boolean;

  addPubKey;
  addTgUsername;
  settings: SettingState;

  constructor(
    public ringData: RingDataService,
    private store: Store<fromRoot.State>
  ) {
    this.ringSettings$ = this.store.select(selectRingSettings);

    this.ringSettings$.subscribe((data) => {
      this.ringSettings = data;
    })

    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;

      this.showLogo = settings.showLogo;
    });

    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.cbNodeOwners$.subscribe((data) => {
      this.segments = data;
    })
    this.pubkeysText = '';
    this.ringName = this.ringData.getRingName();
    this.ringSize = this.ringData.getRingSize();

    this.pubsubServer = this.ringData.getPubsubServer();
  }

  ngOnInit(): void {
  }

  updateShowLogo(event) {
    this.store.dispatch(setShowLogo(event));
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

  setRingSize() {
    this.ringData.setRingSize(this.ringSize);
  }

  saveRingSettings() {
    this.ringData.saveRingSettings(this.segments);
  }

  loadSettings(item) {
    this.ringData.loadSettings(item);

    let pkContents = 'user_name,nodename,pub_key,new,handle,capacity_sat\r\n';

    for (let p of item.ringParticipants) {
      pkContents += `${p.user_name},${p.nodename},${p.pub_key},${p.new},${p.handle},${p.capacity_sat}\r\n`;
    }

    this.pubkeysText = pkContents;
  }

  removeSettings(item) {
    this.store.dispatch(removeRingSetting({ ringSetting: item.cleanRingName }))
  }

  addCbNodeOwner() {
    this.ringData.getNodeInfoApi(this.addPubKey).subscribe((data) => {

      if (data) {
        let no:CbNodeOwner = {
          pub_key: this.addPubKey,
          nodename: data.node.alias,
          user_name: this.addTgUsername,
          handle: this.addTgUsername,
          capacity_sat: data.total_capacity
        }

        console.log(no);
    
        this.store.dispatch(addCbNodeOwner(no));
      }
    })


  }

  removeCbNodeOwner(nodeOwner: CbNodeOwner) {
    this.store.dispatch(removeCbNodeOwner(nodeOwner));


  }

  setPubSubServer() {

  }
}
