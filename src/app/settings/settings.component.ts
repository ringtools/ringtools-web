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
} from '../actions/ring-setting.actions';
import { selectRingSettings } from '../selectors/ring-setting.selectors';
import { selectSettings } from '../selectors/setting.selectors';
import { SettingState } from '../reducers/setting.reducer';
import { setShowLogo } from '../actions/setting.actions';
import { HttpErrorResponse } from '@angular/common/http';
import * as LZString from 'lz-string';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../toast/toast.service';

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
    private store: Store<fromRoot.State>,
    public toastService: ToastService
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
    try {
      this.store.dispatch(setShowLogo(event));
      this.toastService.show('Setting changed', { classname: 'bg-success' });
    } catch (e) {
      this.toastService.show('Error changing setting', {
        classname: 'bg-danger',
      });
    }
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
    if (String(this.pubkeysText).trim().length == 0) {
      this.toastService.show('Groupnodes input is empty', {
        classname: 'bg-danger',
      });
      return;
    }

    try {
      let segments = this.ringData.parseCsvToType(this.pubkeysText);
      this.store.dispatch(loadCbNodeOwners(segments));
      this.toastService.show('Imported groupnodes CSV', {
        classname: 'bg-success',
      });
    } catch (e) {
      this.toastService.show('Error importing groupnodes CSV', {
        classname: 'bg-danger',
      });
    }
  }

  processRingname() {
    try {
      this.ringData.setRingName(this.ringName);
      this.toastService.show(`Ring name set to ${this.ringName}`, {
        classname: 'bg-success',
      });
    } catch (e) {
      this.toastService.show('Error setting ring name', {
        classname: 'bg-danger',
      });
    }
  }

  setRingSize() {
    try {
      this.ringData.setRingSize(this.ringSize);
      this.toastService.show(`Ring size set to ${this.ringSize}`, {
        classname: 'bg-success',
      });
    } catch (e) {
      this.toastService.show('Error setting ring size', {
        classname: 'bg-danger',
      });
    }
  }

  saveRingSettings() {
    try {
      this.ringData.saveRingSettings(this.segments);
      this.toastService.show('Saved ring settings', {
        classname: 'bg-success',
      });
    } catch (e) {
      this.toastService.show('Error saving ring settings', {
        classname: 'bg-danger',
      });
    }
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
    try {
      this.ringData.loadSettings(item);

      let pkContents = this.convertToCsv(item.ringParticipants);

      this.pubkeysText = pkContents;

      this.toastService.show(`Ring load ${item.cleanRingName} successful`, {
        classname: 'bg-success',
      });
    } catch (e) {
      this.toastService.show('Error loading ring', {
        classname: 'bg-error',
      });
    }
  }

  removeSettings(item) {
    try {
      this.store.dispatch(removeRingSetting({ ringSetting: item.cleanRingName }));
      this.toastService.show(`Ring remove ${item.cleanRingName} successful`, {
        classname: 'bg-success',
      });
    } catch (e) {
      this.toastService.show('Error removing ring', {
        classname: 'bg-error',
      });
    }
  }

  addCbNodeOwner() {
    this.addPubKey = String(this.addPubKey).trim();

    if (this.segments.findIndex((val) => val.pub_key == this.addPubKey) != -1) {
      this.toastService.show(`Node ${this.addPubKey} already in list`, {
        classname: 'bg-warning',
      });

      return;
    }


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

          this.toastService.show(`Added node ${data.node.alias}`, {
            classname: 'bg-success',
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        // node probably has no channels yet but key looks correct
        if (error.status == 404 && String(this.addPubKey).length == 66) {
          let no: CbNodeOwner = {
            pub_key: this.addPubKey,
            nodename: String(this.addPubKey).substr(0, 20),
            user_name: this.addTgUsername,
            handle: this.addTgUsername,
            capacity_sat: '0',
          };

          this.store.dispatch(addCbNodeOwner(no));

          this.toastService.show(`Added node ${this.addPubKey}`, {
            classname: 'bg-success',
          });
        } else {
          this.toastService.show('Error adding node', {
            classname: 'bg-danger',
          });
        }
      },
      complete: () => {},
    });
  }

  removeCbNodeOwner(nodeOwner: CbNodeOwner) {
    try {
      this.store.dispatch(removeCbNodeOwner(nodeOwner));
      this.toastService.show(`Removed node ${nodeOwner.nodename}`, {
        classname: 'bg-success',
      });
    } catch (e) {
      this.toastService.show('Error removing node', {
        classname: 'bg-danger',
      });
    }
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
    this.toastService.show('Copied share URL to clipboard', {
      classname: 'bg-success',
    });
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
