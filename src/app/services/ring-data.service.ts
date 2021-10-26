import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NodeInfo } from '../model/node_info.model';
import { RoutingPolicy } from '../model/routing_policy.model';
import initialring from '../data/initialring.txt';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import * as d3 from 'd3';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { addCbNodeOwner, addCbNodeOwners, clearCbNodeOwners, loadCbNodeOwners } from '../actions/cb-node-owner.actions';
import { selectAllNodeInfo, selectAllNodeInfoPubkey } from '../reducers/node-info.reducer';
import { selectAllCbNodeOwners } from '../reducers/cb-node-owner.reducer';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { upsertNodeInfo } from '../actions/node-info.actions';
import { upsertChannel } from '../actions/channel.actions';
import { selectNodeInfos } from '../selectors/node-info.selectors';

@Injectable({
  providedIn: 'root'
})
export class RingDataService {
  ringName = "#SRROF_500Ksats_8thRING"

  cbNodeOwners: CbNodeOwner[] = [];

  private _channelUpdate = new Subject();
  channelUpdate$ = this._channelUpdate.asObservable();

  nodeNames: Map<string, string> = new Map<string, string>();
  nodeToTgMap: Map<string, string> = new Map<string, string>();
  nodeInfo: Map<string, NodeInfo|undefined> = new Map<string, NodeInfo|undefined>();

  channels: any = [];

  viewMode = 'tg';
  colorScale!: any; // D3 color provider


  constructor(
    private http: HttpClient,
    private socket: Socket,
    private store: Store<fromRoot.State>

  ) {
    this.cbNodeOwners = this.parseCsvToType(initialring);

    this.store.dispatch(loadCbNodeOwners(this.cbNodeOwners));

    this.store.select(selectCbNodeOwners).subscribe((res) => {
      let pubkeys = res.map((val) => {
        return val.pub_key;
      })
      this.socket.emit("subscribe_pubkey", { data: pubkeys })
    })

    // this.store.select(selectNodeInfos).subscribe((res) => {
    //   console.log('node', res)
    // });

    // this.store.select(selectAllCbNodeOwners).subscribe((cb) => {
    //   console.log('cb', cb);
    // })

    //this.populateTgMap();
    //    this.populateChannels();

    this.socket.on("pubkey", (data:NodeInfo) => {
      this.store.dispatch(upsertNodeInfo({ nodeInfo: data }));

      this.nodeInfo.set(data.node.pub_key, data);
    });
    this.socket.on("channel", (data) => {
      this.store.dispatch(upsertChannel({ channel: data }));

      this.updateChannel(data);
    });

    this.colorScale = d3.scaleLinear()
      .domain([1, 3.5, 6])
      // @ts-ignore
      .range(["#2c7bb6", "#ffffbf", "#d7191c"])
      // @ts-ignore
      .interpolate(d3.interpolateHcl);
  }

  updateChannel(channelData) {
    let n1 = this.nodeInfo.get(channelData.node1_pub);

    let n1Channels = n1?.channels.filter((data) => {
      return data.channel_id != channelData.channel_id
    })

    let n2 = this.nodeInfo.get(channelData.node2_pub);

    let n2Channels = n2?.channels.filter((data) => {
      return data.channel_id != channelData.channel_id
    })

    n1?.channels.push(channelData);
    n2?.channels.push(channelData);

    if (n1)
      this.nodeInfo.set(n1.node.pub_key, n1);
    if (n2)
      this.nodeInfo.set(n2.node.pub_key, n2);

    this._channelUpdate.next([n1, n2]);
  }

  // registerChannelUpdateListener(cb) {
  //   this.channelUpdateCallbacks.push(cb);
  // }

  // populateTgMap() {
  //   for (let node of this.getSegments()) {
  //     this.nodeToTgMap.set(node.pub_key, node.user_name);
  //   }
  // }

  repopulate() {
    this.channels = [];
    //  this.populateTgMap();
    this.populateChannels();

    this.socket.emit("unsubscribe_all")

    let pubkeys = this.cbNodeOwners.map((val) => {
      return val.pub_key;
    })

    this.socket.emit("subscribe_pubkey", { data: pubkeys })

  }

  // getSegments() {
  //   return this.segments;
  // }

  setSegments(segments: any) {
    //    console.log(set segments)
    //  this.store.dispatch(clearCbNodeOwners());
    console.log(segments);
    this.store.dispatch(loadCbNodeOwners(segments));
  }

  setViewMode(viewMode: string) {
    this.viewMode = viewMode;
  }

  getViewMode() {
    return this.viewMode;
  }

  getRingName() {
    return this.ringName;
  }

  setRingName(ringName: string) {
    this.ringName = ringName;
  }

  getNodeInfoApi(pubkey: string) {
    return this.http.get<NodeInfo>(`${environment.REST_ENDPOINT}/node/${pubkey}`);
  }

  getNodeInfo(pubkey: string) {
    return this.nodeInfo.get(pubkey);
  }

  getCachedNodeInfo(pubkey: string) {
    return this.nodeInfo.get(pubkey);
  }

  nodeHasChannelWith(pubkey: string, channelWith: string) {
    let n = this.nodeInfo.get(pubkey);
    let ret:number|null = null;

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
    let ret: [RoutingPolicy, RoutingPolicy] | [undefined, undefined] = [undefined, undefined];
    if (n) {
      for (let edge of n.channels) {
        if (edge.node1_pub == channelWith) {
          ret = [edge.node2_policy, edge.node1_policy]
        } else if (edge.node2_pub == channelWith) {
          ret = [edge.node1_policy, edge.node2_policy]
        }
      }
    }

    return ret;
  }

  populateChannels() {
    for (let [key, node] of this.cbNodeOwners.entries()) {
      let data = this.getNodeInfo(node.pub_key);
        if (!data)
          return;
        this.nodeNames.set(node.pub_key, data.node.alias);

        this.nodeInfo.set(node.pub_key, data);

        for (let edge of data.channels) {
          let nextIndex = (key + 1) % this.cbNodeOwners.length;

          if (edge.node1_pub == this.cbNodeOwners[nextIndex].pub_key || edge.node2_pub == this.cbNodeOwners[nextIndex].pub_key) {
//            edge.order = key;
            this.channels.push(edge)
          }
        }
      
    };
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
          capacity_sat: parts[5]
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
}
