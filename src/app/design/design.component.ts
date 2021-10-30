import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { DataSet } from 'vis-data';
import { Data, Edge, Options, Node } from 'vis-network';
import { RingDataService } from '../services/ring-data.service';
import { VisNetworkService } from '../vis/network/vis-network.service';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { loadCbNodeOwners, setCbNodeOwners } from '../actions/cb-node-owner.actions';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss']
})
export class DesignComponent implements OnInit, OnDestroy {
  Participants = 'PARTICIPANTS'
  viewMode!: string;

  public visNetwork: string = 'networkId1';
  public visNetworkData!: Data;
  public nodes!: DataSet<Node>;
  public edges!: DataSet<Edge>;
  public visNetworkOptions!: Options;
  allNodes = [];
  allEdges = [];
  selectedNode = '';
  segments: CbNodeOwner[] = [];
  cbNodeOwners$: Observable<CbNodeOwner[]>;
  newSegments: any[] = [];
  participants: any;

  currentNodeInfo: any;
  subs = new Subscription();

  constructor(
    private visNetworkService: VisNetworkService,
    private dragulaService: DragulaService,
    private ringData: RingDataService,
    private store: Store<fromRoot.State>,
    private http: HttpClient
  ) {
    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.cbNodeOwners$.subscribe((data) => {
      this.segments = data;
    })

    this.viewMode = ringData.getViewMode();

    dragulaService.createGroup("PARTICIPANTS", {
      removeOnSpill: true
    });
  }

  viewChange(event: any) {
    this.ringData.setViewMode(event);
    this.refreshNodes();
  }

  public addNode(): void {
    const lastId = this.nodes.length;
    const newId = this.nodes.length + 1;
    this.nodes.add({ id: newId, label: 'New Node' });
    this.edges.add({ from: lastId, to: newId });
    this.visNetworkService.fit(this.visNetwork);
  }

  public networkInitialized(): void {
    // now we can use the service to register on events
    this.visNetworkService.on(this.visNetwork, 'click');

    // open your console/dev tools to see the click params
    this.visNetworkService.click.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {
        //        console.log(eventData[1]);
        this.selectedNode = eventData[1].nodes[0];

        this.currentNodeInfo = this.ringData.getCachedNodeInfo(this.selectedNode);
      }
    });
  }

  refreshNodes() {
    let nodes = this.nodes.map((node): Node => {
      let n: Node = {
        id: node.id,
        color: node.color,
      };
      if (this.viewMode == 'node') {
        n.label = this.ringData.getTgUserByPubkey(node.id.toString()).nodename;
      } else {
        n.label = this.ringData.getUsername(node.id.toString());
      }

      return n;
    })

    this.nodes.update(nodes);

    this.visNetworkData = {
      nodes: this.nodes,
      edges: this.edges
    };
  }

  buildNodes() {
    for (let node of this.segments) {
      let data = this.ringData.getNodeInfo(node.pub_key)
      if (!data)
        break;

      let label;

      if (this.viewMode == 'node') {
        label = this.ringData.getTgUserByPubkey(data.node.pub_key).nodename;
      } else {
        label = this.ringData.getUsername(data.node.pub_key);
      }

      let nodeInfo: Node = {
        id: data.node.pub_key,
        color: data.node.color,
        label: label
        // /* @ts-ignore */
        // label: () => {
        //   if (this.viewMode == 'node') {
        //     return data.node.alias;
        //   } else {
        //     return this.ringData.getTgUserByPubkey(data.node.pub_key)
        //   }
        // }
      };

      this.nodes.add(nodeInfo)

      for (let edge of data.channels) {

        if (!this.edges.get(edge.channel_id)) {
          let e: any = {
            id: edge.channel_id,
            from: edge.node1_pub,
            to: edge.node2_pub,
            dashes: true
          };

          if (!edge.node1_policy || !edge.node2_policy) {
            e.label = "no info";
            e.color = "#ffcc00";
          }
          // else if (edge.node1_policy.disabled == "true" || edge.node2_policy.disabled == "true") {
          //   e.label = "disabled: true";
          //   e.color = "#ff0000";
          // }

          this.edges.add(e);
        }
      }

    }
  }

  ngOnInit(): void {
    this.segments = this.segments;

    this.nodes = new DataSet<Node>();
    this.edges = new DataSet<Edge>([
    ]);
    this.visNetworkData = {
      nodes: this.nodes,
      edges: this.edges
    };

    this.visNetworkOptions = {
      interaction: { hover: true },
      manipulation: {
        enabled: true,
      },
      layout: {
        randomSeed: 681154853
      },
      edges: {
        arrows: {
          // to: {
          //   enabled: true,
          //  // scaleFactor: 5
          // }
        }
      }
    };

    if (this.ringData.isLoaded) {
      this.buildNodes();
    } else {
      this.ringData.isReady$.subscribe(() => {
        this.buildNodes();
      });
    }
  }

  public ngOnDestroy(): void {
    this.visNetworkService.off(this.visNetwork, 'click');
    this.subs.unsubscribe();
    this.dragulaService.destroy('PARTICIPANTS');
  }

  public autoDesign() {
    console.log('auto design start');
    let unconnectedSegments = this.segments.map((val) => val.pub_key);

    this.edges.clear();

    let newSegments: any[] = [];

    let nextNode = unconnectedSegments[0];
    let firstNode = unconnectedSegments[0];
    let overflow = 0;

    while (unconnectedSegments && overflow < (this.segments.length)) {
      let nextIndex = 0;
      let currentNode = nextNode;
      let c: number | null = null;

      if (unconnectedSegments.length > 2) {

        while (c) {
          nextIndex = (nextIndex + 1)
          c = this.ringData.nodeHasChannelWith(currentNode, unconnectedSegments[nextIndex]);

          // TODO: Put in front of new unconnectedsegments so it won't be connected last
        }
        nextNode = unconnectedSegments[nextIndex]

      } else if (unconnectedSegments.length == 2) {
        nextNode = unconnectedSegments[0]
      } else {
        nextNode = firstNode;
      }

      unconnectedSegments = unconnectedSegments.filter(item => item !== currentNode)

      if (currentNode != nextNode) {
        this.edges.add({ from: currentNode, to: nextNode });
        console.log(`${currentNode} => ${nextNode}`, unconnectedSegments.length);

        newSegments.push(currentNode);
      }
      overflow++;
    }

    console.log(newSegments, unconnectedSegments);
    let newMap: any[] = [];
    for (let node of newSegments) {
      newMap.push([node, this.ringData.getTgUserByPubkey(node)])
    }

    console.log(newMap, this.participants);

    this.ringData.setSegments(newMap);
    this.segments = newMap;
  }

  persistOrder() {
    this.store.dispatch(loadCbNodeOwners(this.segments))
  }

  /* @TODO: Implemnent graph export, right-click save should work as well */
  exportGraph() {
    //this.visNetworkService.vis
  }

  /* @TODO: Move to service and add igniter.sh generation */
  downloadChannelsTxt() {
    this.ringData.downloadChannelsTxt();
  }

  downloadIgniterPubkeys() {
    let igniterText = 'declare pub_keys=(\r\n';

    for (let s of this.segments) {
      let handle = s.handle;

      if (handle == 'None')
        handle = s.user_name

      igniterText += `    ${s.pub_key} # ${handle}\r\n`
    }

    igniterText += ')'

    this.ringData.downloadFile(igniterText);
  }
}
