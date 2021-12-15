import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NodeInfo } from '../model/node_info.model';
import { RoutingPolicy } from '../model/routing_policy.model';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import * as d3 from 'd3';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { loadCbNodeOwners } from '../actions/cb-node-owner.actions';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { upsertNodeInfo } from '../actions/node-info.actions';
import { upsertChannel } from '../actions/channel.actions';
import { selectSettings } from '../selectors/setting.selectors';
import { SettingState } from '../reducers/setting.reducer';
import {
  setPubsubServer,
  setRingLeader,
  setRingName,
  setRingSize,
  setViewMode,
} from '../actions/setting.actions';
import { RingSetting } from '../model/ring-setting.model';
import { DomSanitizer } from '@angular/platform-browser';
import { upsertRingSetting } from '../actions/ring-setting.actions';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RingDataService {
  ringName = 'Loading...';
  ringSize: number;
  ringLeader: CbNodeOwner;

  cbNodeOwners: CbNodeOwner[] = [];

  private _channelUpdate = new Subject();
  channelUpdate$ = this._channelUpdate.asObservable();

  private _isReady = new Subject();
  isReady$ = this._isReady.asObservable();

  nodeNames: Map<string, string> = new Map<string, string>();
  nodeToTgMap: Map<string, CbNodeOwner> = new Map<string, CbNodeOwner>();
  nodeInfo: Map<string, NodeInfo | undefined> = new Map<
    string,
    NodeInfo | undefined
  >();

  channels: any = [];
  isLoaded: boolean = false;
  viewMode = 'tg';
  settings!: SettingState;
  colorScale!: any; // D3 color provider

  constructor(
    private http: HttpClient,
    private socket: Socket,
    private sanitizer: DomSanitizer,
    private store: Store<fromRoot.State>
  ) {
    this.store.select(selectCbNodeOwners).subscribe((res) => {
      let pubkeys = res.map((val) => {
        return val.pub_key;
      });

      this.cbNodeOwners = res;

      for (let o of this.cbNodeOwners) {
        this.nodeToTgMap.set(o.pub_key, o);
      }

      this.socket.emit('subscribe_pubkey', { data: pubkeys });
    });

    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;
    });

    // this.store.select(selectNodeInfos).subscribe((res) => {
    //   console.log('node', res)
    // });

    // this.store.select(selectAllCbNodeOwners).subscribe((cb) => {
    //   console.log('cb', cb);
    // })

    //this.populateTgMap();
    //    this.populateChannels();

    this.socket.on('pubkey', (data: NodeInfo) => {
      this.store.dispatch(upsertNodeInfo({ nodeInfo: data }));

      this.nodeInfo.set(data.node.pub_key, data);

      if (this.nodeInfo.size == this.cbNodeOwners.length) {
        this.isLoaded = true;
        this._isReady.next(this.isLoaded);
      }
    });
    this.socket.on('channel', (data) => {
      this.store.dispatch(upsertChannel({ channel: data }));

      this.updateChannel(data);
    });

    this.colorScale = d3
      .scaleLinear()
      .domain([1, 3.5, 6])
      // @ts-ignore
      .range(['#2c7bb6', '#ffffbf', '#d7191c'])
      // @ts-ignore
      .interpolate(d3.interpolateHcl);
  }

  getIsLoaded() {
    return this.isLoaded;
  }

  getUsername(pub_key: string) {
    let ret = this.getTgUserByPubkey(pub_key);
    if (ret.handle == 'None') {
      return ret.user_name;
    }
    return `@${ret.handle}`;
  }

  updateChannel(channelData) {
    let n1 = this.nodeInfo.get(channelData.node1_pub);

    let n1Channels = n1?.channels.filter((data) => {
      return data.channel_id != channelData.channel_id;
    });

    let n2 = this.nodeInfo.get(channelData.node2_pub);

    let n2Channels = n2?.channels.filter((data) => {
      return data.channel_id != channelData.channel_id;
    });

    /** @TODO: Because of immutable objects this is no longer possible */
    //    n1?.channels.push(channelData);
    //  n2?.channels.push(channelData);

    if (n1) {
      this.nodeInfo.set(n1.node.pub_key, n1);
      this.store.dispatch(upsertNodeInfo({ nodeInfo: n1 }));
    }
    if (n2) {
      this.nodeInfo.set(n2.node.pub_key, n2);
      this.store.dispatch(upsertNodeInfo({ nodeInfo: n2 }));
    }

    this._channelUpdate.next([n1, n2]);
  }

  repopulate() {
    this.channels = [];
    this.populateChannels();

    this.socket.emit('unsubscribe_all');

    let pubkeys = this.cbNodeOwners.map((val) => {
      return val.pub_key;
    });

    this.socket.emit('subscribe_pubkey', { data: pubkeys });
  }

  setSegments(segments: any) {
    this.store.dispatch(loadCbNodeOwners(segments));
  }

  setViewMode(viewMode: string) {
    this.store.dispatch(setViewMode(viewMode));
  }

  getViewMode() {
    return this.settings.viewMode;
  }

  getRingName() {
    return this.settings.ringName;
  }

  getRingSize() {
    return this.settings.ringSize;
  }

  setRingName(ringName: string) {
    this.ringName = ringName;
    this.store.dispatch(setRingName(ringName));
  }

  setRingSize(ringSize: number) {
    this.ringSize = ringSize;
    this.store.dispatch(setRingSize(ringSize));
  }

  setRingLeader(ringLeader: CbNodeOwner) {
    this.ringLeader = ringLeader;
    this.store.dispatch(setRingLeader(ringLeader));
  }

  getNodeInfoApi(pubkey: string) {
    return this.http.get<NodeInfo>(
      `${environment.REST_ENDPOINT}/node/${pubkey}`
    );
  }

  getNodeInfo(pubkey: string) {
    return this.nodeInfo.get(pubkey);
  }

  /**
   * @deprecated
   * @param pubkey
   * @returns
   */
  getCachedNodeInfo(pubkey: string) {
    return this.getNodeInfo(pubkey);
  }

  nodeHasChannelWith(pubkey: string, channelWith: string) {
    let n = this.nodeInfo.get(pubkey);
    let ret: number | null = null;

    if (n) {
      for (let edge of n.channels) {
        if (edge.node1_pub == channelWith || edge.node2_pub == channelWith) {
          ret = edge.channel_id;
        }
      }
    }

    return ret;
  }

  getChannelPolicies(pubkey: string, channelWith: string) {
    let n = this.nodeInfo.get(pubkey);
    let ret: [RoutingPolicy, RoutingPolicy] | [undefined, undefined] = [
      undefined,
      undefined,
    ];
    if (n) {
      for (let edge of n.channels) {
        if (edge.node1_pub == channelWith) {
          ret = [edge.node2_policy, edge.node1_policy];
        } else if (edge.node2_pub == channelWith) {
          ret = [edge.node1_policy, edge.node2_policy];
        }
      }
    }

    return ret;
  }

  setPubsubServer(pubsubServer: string) {
    this.store.dispatch(setPubsubServer(pubsubServer));
  }

  getPubsubServer() {
    return this.settings.pubsubServer;
  }

  populateChannels() {
    for (let [key, node] of this.cbNodeOwners.entries()) {
      let data = this.getNodeInfo(node.pub_key);
      if (!data) return;
      this.nodeNames.set(node.pub_key, data.node.alias);

      this.nodeInfo.set(node.pub_key, data);

      for (let edge of data.channels) {
        let nextIndex = (key + 1) % this.cbNodeOwners.length;

        if (
          edge.node1_pub == this.cbNodeOwners[nextIndex].pub_key ||
          edge.node2_pub == this.cbNodeOwners[nextIndex].pub_key
        ) {
          this.channels.push(edge);
        }
      }
    }
  }

  /**
   * CSV
   * @returns
   */
  parseCsvToType(contents: string) {
    let segmentLines = contents.split('\n');
    let segments: CbNodeOwner[] = [];
    for (let line of segmentLines.slice(1)) {
      let parts = line.split(',');
      if (parts.length > 1) {
        segments.push({
          user_name: parts[0],
          nodename: parts[1],
          pub_key: parts[2],
          new: Boolean(parts[3]),
          handle: parts[4],
          capacity_sat: parts[5],
        });
      }
    }

    return segments;
  }

  getColorScale() {
    return this.colorScale;
  }

  /**
   * Get channels in correct order
   */
  getChannels() {
    return this.channels.sort((first: any, second: any) => {
      return first.order < second.order;
    });
  }

  getTgUserByPubkey(pubkey: string) {
    return this.nodeToTgMap.get(pubkey);
  }

  getAliasByPubkey(pubkey: string) {
    return this.nodeNames.get(pubkey);
  }

  getRingLeader() {
    this.ringLeader;
  }

  loadSettings(item: RingSetting) {
    this.setRingName(item.ringName);
    this.setRingSize(item.ringSize);
    this.store.dispatch(loadCbNodeOwners(item.ringParticipants));
  }

  saveRingSettings(segments) {
    if (segments) {
      let ringSettings: RingSetting = {
        ringName: this.getRingName(),
        ringParticipants: segments,
        cleanRingName: this.getRingName().replace(
          /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
          ''
        ),
        id: this.getRingName().replace(
          /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
          ''
        ),
        ringSize: this.ringSize,
        ringLeader: this.ringLeader,
      };
      this.store.dispatch(upsertRingSetting({ ringSetting: ringSettings }));
    }
  }

  downloadChannelsTxt() {
    if (!this.getChannels().length) {
      this.populateChannels();
    }

    let data = '';

    for (let channel of this.getChannels()) {
      data += channel.channel_id + '\r\n';
    }

    this.doDownloadFileWithData(data, 'channels.txt');
  }

  downloadPubkeysTgTxt() {
    if (!this.getChannels().length) {
      this.populateChannels();
    }

    let data = '';

    for (let no of this.cbNodeOwners) {
      data += `${no.pub_key},${this.getUsername(no.pub_key)}\r\n`;
    }

    this.doDownloadFileWithData(data, 'pubkeys.txt');
  }

  doDownloadFileWithData(data, filename) {
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(data)
    );
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  downloadFile(data) {
    this.doDownloadFileWithData(data, 'file.txt');
  }
}
