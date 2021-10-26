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

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss']
})
export class DesignComponent implements OnInit, OnDestroy {
  Participants = 'PARTICIPANTS'

  public visNetwork: string = 'networkId1';
  public visNetworkData!: Data;
  public nodes!: DataSet<Node>;
  public edges!: DataSet<Edge>;
  public visNetworkOptions!: Options;
  allNodes = [];
  allEdges = [];
  selectedNode = '';
//  segments: any[] = [];
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


    dragulaService.createGroup("PARTICIPANTS", {
      removeOnSpill: true
    });
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
        console.log(eventData[1]);
        this.selectedNode = eventData[1].nodes[0];

        this.currentNodeInfo = this.ringData.getCachedNodeInfo(this.selectedNode);
      }
    });
  }

  buildNodes() {
    for (let node of this.segments) {
      let data = this.ringData.getNodeInfo(node.pub_key)
      if (!data)
        break;
        
        this.nodes.add({
          id: data.node.pub_key,
          color: data.node.color,
          label: data.node.alias
        })

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
      edges: {
        arrows: {
          // to: {
          //   enabled: true,
          //  // scaleFactor: 5
          // }
        }
      }
    };

    this.buildNodes();
  }

  public ngOnDestroy(): void {
    this.visNetworkService.off(this.visNetwork, 'click');
    this.subs.unsubscribe();
    this.dragulaService.destroy('PARTICIPANTS');
  }

  public autoDesign() {
    console.log('auto design start');
    let unconnectedSegments = this.segments.map((val) => val.pub_key);

    // let newEdges = this.edges.map((val) => {
    //   val.hidden = true;
    //   return val;
    // });

    // console.log(newEdges);

    this.edges.clear();

    let newSegments:any[] = [];

    let nextNode = unconnectedSegments[0];
    let firstNode = unconnectedSegments[0];
    let overflow = 0;

    while (unconnectedSegments && overflow < (this.segments.length )) {
      let nextIndex = 0;
      let currentNode = nextNode;
      let c:number|null = null;

      if (unconnectedSegments.length > 2) {

        while (c) {
          nextIndex = (nextIndex + 1) 
          c = this.ringData.nodeHasChannelWith(currentNode, unconnectedSegments[nextIndex]);
          
          // TODO: Put in front of new unconnectedsegments so it won't be connected last
        }
        nextNode = unconnectedSegments[nextIndex]

      } else if (unconnectedSegments.length == 2) {
    //    console.log("LAST", currentNode, nextNode, firstNode, unconnectedSegments.length);
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
    let newMap:any[] = [];
    for (let node of newSegments) {
      newMap.push([node, this.ringData.getTgUserByPubkey(node)])
    }

    console.log(newMap, this.participants);

    this.ringData.setSegments(newMap);
    this.segments = newMap;
    // for (let [i, node] of segments.entries()) {
    //  // console.log(i,node);
    //   let nextIndex = (i + 1) % segments.length;

    //   let c = " ";

    //   while (c) {
    //     c = this.ringData.nodeHasChannelWith(node, segments[nextIndex]);
    //     nextIndex = (nextIndex + 1) % segments.length
    //   }

    //   this.edges.add({ from: node, to: segments[nextIndex] });


    //      this.newSegments.push(node);
    //   console.log(node, );
  }

  exportGraph() {
    //this.visNetworkService.vis
  }

}
