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

@Injectable({
  providedIn: 'root'
})
export class RingDataService {
  ringName = "#SRROF_500Ksats_8thRING"

  segments:CbNodeOwner[] = [];

  private _channelUpdate = new Subject();
  channelUpdate$ = this._channelUpdate.asObservable();
  
//   segments = [ // format is <pubkey>,<tg username>
//     ['0205a19356bbb7482057356aef070285a2ce6141d2448545210e9d575b57eddd37', '@dsbaars'],
//     ['02a4ac8575fdbfeafd842b438539a889e9df5be357e6a7ddd9f6c7378600fdcf8a', '@x7b409'],
//     ['02a84d676464a90effe12e6de21c5c2d8ff5ac7b6acda7f8c216d0f958ca547afb', '@DeToekan'],
//     ['029f1b0921c3df73f96adfc4820f18c1af9832e3b46607064b3455274250a2db77', '@Prodigy_db'],
//     ['021cbd1078fabaeb428eef48ea1ff118d2f970ffd14473e04f0cdaf8cd4924ffbc', 'Jan-d-VH'],
//     ['022328fe0575587d5b67d18a134ed9887db5985ded61ac2a3391c10cabfcb6612a', 'Bråm'],
//     ['034e0503209b75b9aaee5e23bcc4dc768341038c72bf42e1b3d13c984c9cedbbaa', 'J.'],
//     ['03ac162fb10b9cb3af636737613e36324fef0e09bf736b089fe7f8d9542f2f2d25', 'Peter'],
//    // ['03334c3cc8de31cf27e925209f6d51912839423d1e55b10bef5f256f802f2c88f2', 'Stef']
// //    ['03e691f81f08c56fa876cc4ef5c9e8b727bd682cf35605be25d48607a802526053', '@kaaskoekje']
//   ]

//   segments = [ // format is <pubkey>,<tg username>
//     ['0205a19356bbb7482057356aef070285a2ce6141d2448545210e9d575b57eddd37', '@dsbaars'],
//     ['02a84d676464a90effe12e6de21c5c2d8ff5ac7b6acda7f8c216d0f958ca547afb', '@DeToekan'],
//     // ['029f1b0921c3df73f96adfc4820f18c1af9832e3b46607064b3455274250a2db77', '@Prodigy_db'],
//     ['021cbd1078fabaeb428eef48ea1ff118d2f970ffd14473e04f0cdaf8cd4924ffbc', 'Jan-d-VH'],
//     ['034e0503209b75b9aaee5e23bcc4dc768341038c72bf42e1b3d13c984c9cedbbaa', 'J.'],
//     // ['03ac162fb10b9cb3af636737613e36324fef0e09bf736b089fe7f8d9542f2f2d25', 'Peter'],
//     ['03334c3cc8de31cf27e925209f6d51912839423d1e55b10bef5f256f802f2c88f2', 'Stef'],
//     // ['02a4ac8575fdbfeafd842b438539a889e9df5be357e6a7ddd9f6c7378600fdcf8a', '@x7b409'],
//     ['022328fe0575587d5b67d18a134ed9887db5985ded61ac2a3391c10cabfcb6612a', 'Bråm'],

// //    ['03e691f81f08c56fa876cc4ef5c9e8b727bd682cf35605be25d48607a802526053', '@kaaskoekje']
//   ]

  nodeNames:Map<string, string> = new Map<string,string>();
  nodeToTgMap:Map<string, string> = new Map<string,string>();
  nodeInfo:Map<string,any> = new Map<string,any>();

  channels:any = [];

  viewMode = 'tg';
  colorScale!: any; // D3 color provider


  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { 
    this.segments = this.parseCsvToType(initialring);
    this.populateTgMap();
    this.populateChannels();
    
    let pubkeys = this.segments.map((val) => {
      return val.pub_key;
    })

    this.socket.emit("subscribe_pubkey", { data: pubkeys })

    this.socket.on("pubkey", (data) => {
      this.nodeInfo.set(data.node.pub_key, data);
    });
    this.socket.on("channel", (data) => {
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

    let n1Channels = n1.channels.filter((data) => {
      return data.channel_id != channelData.channel_id
    })

    let n2 = this.nodeInfo.get(channelData.node2_pub);

    let n2Channels = n2.channels.filter((data) => {
      return data.channel_id != channelData.channel_id
    })

    n1.channels.push(channelData);
    n2.channels.push(channelData);

    this.nodeInfo.set(n1.node.pub_key, n1);
    this.nodeInfo.set(n2.node.pub_key, n2);

    this._channelUpdate.next([n1, n2]);
  }

  // registerChannelUpdateListener(cb) {
  //   this.channelUpdateCallbacks.push(cb);
  // }

  populateTgMap() {
    for (let node of this.getSegments()) {
      this.nodeToTgMap.set(node.pub_key, node.user_name);
    }
  }

  repopulate() {
    this.channels = [];
    this.populateTgMap();
    this.populateChannels();

    this.socket.emit("unsubscribe_all")

    let pubkeys = this.segments.map((val) => {
      return val.pub_key;
    })

    this.socket.emit("subscribe_pubkey", { data: pubkeys })

  }

  getSegments() {
    return this.segments;
  }

  setSegments(segments:any) {
    this.segments = segments;
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

  getNodeInfo(pubkey: string) {
    return this.http.get<NodeInfo>(`${environment.REST_ENDPOINT}/node/${pubkey}`);
  }

  // getNode(pubkey: string) {
  //   this.getNodeInfo(pubkey).
  // }

  getCachedNodeInfo(pubkey: string) {
    return this.nodeInfo.get(pubkey);
  }

  nodeHasChannelWith(pubkey:string, channelWith:string) {
    let n = this.nodeInfo.get(pubkey);
    let ret = null;
    for (let edge of n.channels) {
      if (edge.node1_pub == channelWith || edge.node2_pub == channelWith) {
        ret = edge.channel_id;
      }
    }
    
    return ret;
  }

  getChannelPolicies(pubkey:string, channelWith:string) {
    let n = this.nodeInfo.get(pubkey);
    let ret:[RoutingPolicy,RoutingPolicy] | [undefined, undefined] = [undefined, undefined];
    for (let edge of n.channels) {
      if (edge.node1_pub == channelWith) {
        ret = [edge.node2_policy, edge.node1_policy]
      } else if (edge.node2_pub == channelWith) {
        ret = [edge.node1_policy, edge.node2_policy]
      }
    }
    
    return ret;
  }

  populateChannels() {
    for (let [key, node] of this.getSegments().entries()) {
      this.getNodeInfo(node.pub_key).subscribe((data: any) => {
        if (!data)
          return;
        this.nodeNames.set(node.pub_key, data.node.alias);

        this.nodeInfo.set(node.pub_key, data);

        for (let edge of data.channels) {
          let nextIndex = (key + 1) % this.getSegments().length;

          if (edge.node1_pub == this.getSegments()[nextIndex].pub_key || edge.node2_pub == this.getSegments()[nextIndex].pub_key) {
            edge.order = key;
            this.channels.push(edge)
          }
        }
      })
    };
  }

  /**
   * CSV
   * @returns 
   */
  parseCsvToType(contents:string) {
    let segmentLines = contents.split('\n');
    let segments:CbNodeOwner[] = [];
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
    return this.channels.sort((first:any, second:any) => {
      return first.order < second.order;
    });
  }

  getTgUserByPubkey(pubkey:string) {
    return this.nodeToTgMap.get(pubkey);
  }

  getAliasByPubkey(pubkey:string) {
    return this.nodeNames.get(pubkey);
  }
}
