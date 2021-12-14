import { Component, OnInit } from '@angular/core';
import { RingDataService } from '../services/ring-data.service';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { Observable } from 'rxjs';
import {
  addCbNodeOwner,
  loadCbNodeOwners,
  removeCbNodeOwner,
} from '../actions/cb-node-owner.actions';
import { RingSetting } from '../model/ring-setting.model';
import {
  removeRingSetting,
  upsertRingSetting,
} from '../actions/ring-setting.actions';
import { selectRingSettings } from '../selectors/ring-setting.selectors';
import { selectSettings } from '../selectors/setting.selectors';
import { SettingState } from '../reducers/setting.reducer';
import { setShowLogo } from '../actions/setting.actions';
import { HttpErrorResponse } from '@angular/common/http';
import * as LZString from 'lz-string';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  segments: CbNodeOwner[] | undefined;
  pubkeysText: any = '';
  ringName: any = '';
  ringSize: number;
  pubsubServer: string = '';
  cbNodeOwners$: Observable<CbNodeOwner[]>;
  ringSettings$: Observable<RingSetting[]>;
  ringSettings: RingSetting[] = [];
  tempNodename = '';
  showLogo: boolean;
  shareUrl: string = '';

  addPubKey;
  addTgUsername;
  settings: SettingState;

  constructor(
    public ringData: RingDataService,
    private route: ActivatedRoute,
    private store: Store<fromRoot.State>
  ) {
    this.ringSettings$ = this.store.select(selectRingSettings);

    this.ringSettings$.subscribe((data) => {
      this.ringSettings = data;
    });

    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;

      this.showLogo = settings.showLogo;
    });

    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.cbNodeOwners$.subscribe((data) => {
      this.segments = data;
    });
    this.pubkeysText = '';
    this.ringName = this.ringData.getRingName();
    this.ringSize = this.ringData.getRingSize();

    this.pubsubServer = this.ringData.getPubsubServer();
  }

  ngOnInit(): void {
    const loadRing = this.route.snapshot.queryParamMap.get('load');

    if (loadRing) {
      let importData = JSON.parse(
        LZString.decompressFromEncodedURIComponent(loadRing)
      );
      this.ringData.setRingName(importData['name']);
      this.ringData.setRingSize(importData['size']);

      // This can be beter, listen to the setRingName/Size action
      this.ringName = importData['name'];
      this.ringSize = importData['size'];

      this.pubkeysText =
        'user_name,nodename,pub_key,new,handle,capacity_sat\r\n';
      this.pubkeysText += importData['data'];

      let segments = this.ringData.parseCsvToType(this.pubkeysText);
      this.store.dispatch(loadCbNodeOwners(segments));
    }
  }

  parseCapacityName() {
    let capacity: String = this.ringName.match(/_(\d+[K|M])sats_/)[1];

    capacity = capacity.toString().replace('K', '000');
    capacity = capacity.toString().replace('M', '000000');

    this.ringSize = Number(capacity);
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
    this.store.dispatch(loadCbNodeOwners(segments));
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

  convertToCsv(ringParticipants, header: boolean = true) {
    let pkContents = '';

    if (header)
      pkContents = 'user_name,nodename,pub_key,new,handle,capacity_sat\r\n';

    for (let p of ringParticipants) {
      pkContents += `${p.user_name},${p.nodename},${p.pub_key},${p.new},${p.handle},${p.capacity_sat}\r\n`;
    }

    return pkContents;
  }

  loadSettings(item) {
    this.ringData.loadSettings(item);

    let pkContents = this.convertToCsv(item.ringParticipants);

    this.pubkeysText = pkContents;
  }

  removeSettings(item) {
    this.store.dispatch(removeRingSetting({ ringSetting: item.cleanRingName }));
  }

  addCbNodeOwner() {
    this.addPubKey = String(this.addPubKey).trim();

    this.ringData.getNodeInfoApi(this.addPubKey).subscribe({
      next: (data) => {
        if (data) {
          let no: CbNodeOwner = {
            pub_key: this.addPubKey,
            nodename: data.node.alias,
            user_name: this.addTgUsername,
            handle: this.addTgUsername,
            capacity_sat: data.total_capacity,
          };

          //        console.log(no);

          this.store.dispatch(addCbNodeOwner(no));
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error.status == 404 && String(this.addPubKey).length == 66) {
          let no: CbNodeOwner = {
            pub_key: this.addPubKey,
            nodename: String(this.addPubKey).substr(0, 20),
            user_name: this.addTgUsername,
            handle: this.addTgUsername,
            capacity_sat: '0',
          };

          this.store.dispatch(addCbNodeOwner(no));
        }
      },
      complete: () => {},
    });
  }

  removeCbNodeOwner(nodeOwner: CbNodeOwner) {
    this.store.dispatch(removeCbNodeOwner(nodeOwner));
  }

  setPubSubServer() {}

  exportJSON() {
    let ringData = {
      data: this.convertToCsv(this.ringData.cbNodeOwners, false),
      name: this.ringData.getRingName(),
      size: this.ringData.getRingSize(),
    };
    let co = LZString.compressToEncodedURIComponent(JSON.stringify(ringData));
    let shareUrl = `${window.location.origin}${window.location.pathname}?load=${co}`;
    this.copyToClipboard(shareUrl);
    this.shareUrl = shareUrl;
  }

  public copyToClipboard(data: string): void {
    const listener = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', data);
      e.preventDefault();
      document.removeEventListener('copy', listener);
    };
    document.addEventListener('copy', listener);
    document.execCommand('copy');
  }
}
