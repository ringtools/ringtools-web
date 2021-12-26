import { Component, OnInit } from '@angular/core';
import { RingDataService } from '../services/ring-data.service';
import { NodeOwner } from '../model/node_owner.model';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { selectNodeOwners } from '../selectors/node-owner.selectors';
import { Observable } from 'rxjs';
import {
  addNodeOwner,
  loadNodeOwners,
  removeNodeOwner,
} from '../actions/node-owner.actions';
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
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { parseToEmoji } from '../utils/utils';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  nodeOwners: NodeOwner[] | undefined;
  pubkeysText: any = '';
  ringName: any = '';
  ringSize: number;
  nodeOwners$: Observable<NodeOwner[]>;
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
    public toastService: ToastService,
    public sanitizer: DomSanitizer
  ) {
    this.ringSettings$ = this.store.select(selectRingSettings);

    this.ringSettings$.subscribe((data) => {
      this.ringSettings = data;
    });

    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;

      this.showLogo = settings.showLogo;
      this.ringName = this.ringData.getRingName();
      this.ringSize = this.ringData.getRingSize();

    });

    this.nodeOwners$ = this.store.pipe(select(selectNodeOwners));

    this.nodeOwners$.subscribe((data) => {
      this.nodeOwners = data;
    });
    this.pubkeysText = '';
  }

  ngOnInit(): void {
    const loadRing = this.route.snapshot.queryParamMap.get('load');

    if (loadRing) {
      this.parseOldLoadQueryString(loadRing)
    }

    const loadRingNew = this.route.snapshot.queryParamMap.get('l');
    if (loadRingNew) {
      this.parseLoadQueryString(loadRingNew)
    }
  }


  /**
   * @deprecated
   * @param loadRing 
   */
  parseOldLoadQueryString(loadRing) {
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
    this.store.dispatch(loadNodeOwners(segments));
  }

  parseLoadQueryString(loadRing) {
    let importData = JSON.parse(
      LZString.decompressFromEncodedURIComponent(loadRing)
    );
    this.ringData.setRingName(importData['name']);
    this.ringData.setRingSize(importData['size']);

    let segments = this.ringData.parseNewExportFormat(importData['data']);
    this.store.dispatch(loadNodeOwners(segments));
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
    return this.nodeOwners;
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

      this.store.dispatch(loadNodeOwners(segments));
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
      this.ringData.saveRingSettings(this.nodeOwners);
      this.toastService.show('Saved ring settings', {
        classname: 'bg-success',
      });
    } catch (e) {
      this.toastService.show('Error saving ring settings', {
        classname: 'bg-danger',
      });
    }
  }

  convertToCsv(ringParticipants:CbNodeOwner[], header: boolean = true) {
    let pkContents = '';

    if (header)
      pkContents = 'user_name,nodename,pub_key,new,handle,capacity_sat\r\n';

    for (let p of ringParticipants) {
      pkContents += `${p.first_name},${p.nodename},${p.pub_key},false,${p.username},0\r\n`;
    }

    return pkContents;
  }


// nu
// http://localhost:4200/settings?load=N4IgJghgLhIFwgK4DswFMBmBLZawBoAGAJmMIE4BjCAdmIGZiA2AI2IiYFZjPyjSK1Oo1bsuPckzRMmGDAEYALJkWtpNcosqLOhABxgWejMc7UWTevSZ6InMIa0t8KdNlwFXmHHhepvHgA6AE6ByF7uvgAiaAAyaAC2-BAQxBbyxPL0dGiEGDw6lGByhIpglMQYnHrEVITyaEb05QZ6nAqUdMXanCxoevSd1J7+kSNuPuMBeCFhEZP4AEJoEJQAFouICQBysUT0LPJgisoK5DT08vLkGOQW5BCE3Bgsijdo5IRgxizodzRHNBZFifBxyHRoSrkLJMYhvPwTDwI6ZTMazcKjBYAQQAzlBggB7ZAEsAAG32elUKT0tn6AK+hBYRRpWRqGCY8iYb04vXIzEIX2IYB4EHotwwNEI-XOLAwlAqxG0cORYxVC3mQVCGMRvli2yiAEkAEoAaQAygB5bYUmgQG7ENCUDCEGSaKq3SjcPS5do0LT0WiKNiStiUuTMVLyPTyGjVchiphgcgPBrENVIjW+TNgdHZ-ZGVMsR6EbIQPrtLL56OQosC0vlhTWPR0CAnJguj55MCceS9AGaEg2TjZDBgGhoRjtRQMJh2xjprOYjNLmZavMkQix+gfUjlYfxzIl-ib4c7oWe+gH+QlsqcvCEShixSrF1MSgc4Ue+N86d6EiKDBrEVXoGlnSgF1RdUVxzNdoP2HgjGKGhtDAKUMFWYdCHg3oDAlFC0Iw+gSEvVQ-w5Sg9D5ChrgFGpyD0IwWE3ejAIDF4iIuOxSG9CDeOzXM4LNKA0EwfZ8hYA5N0UJQiOHPoxEfRQiLYF0JQLWp6E4ETrGyRlPgfWoWQgGpmjfYpIOXHULNXMIQHwEBkAgBI0HgEAzSNI0LQAMQAfU4ABZHFoBxHymCgNYjQNbYAHE7JAHEsAALxcuBdAFdKAF8gA
// nu
// http://localhost:4200/settings?load=N4IgJghgLhIFwgK4DswFMBmBLZawBoAGAJmMIE4BjCAdmIGZiA2AI2IiYFZjPym0mTDBgCMAFkxjWAmuTGUxnQgA4wLZRg2dqLJvXpNlETmDXyW+FOmy4wAHyuYceIuwjFdI4iPp00hDB5FSjBhQjEwSmIMTmViKkIRNHV6SNVlTlFKOlCFThY0ZXps6gJHGzwHVCdbInoWETAxCVFyGnoREXIMcl1yCEJuDBYxbrRyQjANFnRemka0HxYJ02FFNGjyHyZiUctqivty5wJCemUpCAhlI0L5ycIWEJufOIwmESZRznzyZkJJsQwDwIPQehgaIRCm0WBhKFFiApdvtrCcqqjamdlDQIN1iGhKBhCII5DEepRuMp-JkaPJ6LQxGxIWwLsJmO4RMoRDRYuQwUwwOR+kliCiapVjpj6lyNiwBmccQVMttsexmkxieMAmBOCJ8vM5CRDJxfBgwDQ0IxMmIGExcYwxYd0eLTmQefRxqRIia+d4zhFPnhCJQwWIIJRiUxKB9geS+X8bcoSGIMAZEfkknbKI60ZKXGceOpQjQFGAoRhwyaSPQ5IZiSJKMo-hQugC4uRlOoWIRZBp9BBhvQe-TuMQqTnbM7DnVAix6j2xOIhyaCuwo-QxEO2MSIeovHzOGhLXpmRNg-EXtcGGAo6EygcTiB8CBkBAALZoeAgADKACVfwA8gAYgA+pwACyADO0CQSBTBQAAFr+ACSAByADiT4gJBWAAF6fnASgAsRAC+QA



  loadSettings(item) {
    try {
      this.ringData.loadSettings(item);

      let rpCb:CbNodeOwner[] = item.ringParticipants;

      let pkContents = this.convertToCsv(rpCb);

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

  emojiPrefix(ring) {
    return this.sanitizer.bypassSecurityTrustHtml(`${parseToEmoji(ring.cleanRingName)}&nbsp;&nbsp;${ring.cleanRingName} (${ring.ringSize})`);
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

  addNodeOwner() {
    this.addPubKey = String(this.addPubKey).trim();

    if (this.nodeOwners.findIndex((val) => val.pub_key == this.addPubKey) != -1) {
      this.toastService.show(`Node ${this.addPubKey} already in list`, {
        classname: 'bg-warning',
      });

      return;
    }


    this.ringData.getNodeInfoApi(this.addPubKey).subscribe({
      next: (data) => {
        if (data) {
          let no: NodeOwner = {
            pub_key: this.addPubKey,
            nodename: data.node.alias,
            first_name: this.addTgUsername,
            username: this.addTgUsername,
          };

          this.store.dispatch(addNodeOwner(no));

          this.toastService.show(`Added node ${data.node.alias}`, {
            classname: 'bg-success',
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        // node probably has no channels yet but key looks correct
        if (error.status == 404 && String(this.addPubKey).length == 66) {
          let no: NodeOwner = {
            pub_key: this.addPubKey,
            nodename: String(this.addPubKey).substring(0, 20),
            first_name: this.addTgUsername,
            username: this.addTgUsername,
          };

          this.store.dispatch(addNodeOwner(no));

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

  removeNodeOwner(nodeOwner: NodeOwner) {
    try {
      this.store.dispatch(removeNodeOwner(nodeOwner));
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
      data: this.ringData.convertToExportFormat(this.ringData.nodeOwners),
      name: this.ringData.getRingName(),
      size: this.ringData.getRingSize(),
    };
    let co = LZString.compressToEncodedURIComponent(JSON.stringify(ringData));
    let shareUrl = `${window.location.origin}${window.location.pathname}?l=${co}`;
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

  getUsername(nodeOwner) {
    if (nodeOwner.username == 'None') {
      return nodeOwner.first_name;
    }
    return `@${nodeOwner.username}`;
  }
}
