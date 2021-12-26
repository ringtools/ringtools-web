import { Component, OnDestroy, OnInit } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { DataSet } from 'vis-data';
import { Data, Edge, Options, Node } from 'vis-network';
import { RingDataService } from '../services/ring-data.service';
import { VisNetworkService } from '../vis/network/vis-network.service';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { NodeOwner } from '../model/node_owner.model';
import { selectNodeOwners } from '../selectors/node-owner.selectors';
import { loadNodeOwners } from '../actions/node-owner.actions';
import { selectSettings } from '../selectors/setting.selectors';
import { SettingState } from '../reducers/setting.reducer';
import { selectRingSettings } from '../selectors/ring-setting.selectors';
import { RingSetting } from '../model/ring-setting.model';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss']
})
export class DesignComponent implements OnInit, OnDestroy {
  viewMode!: string;

  public visNetwork: string = 'networkId1';
  public visNetworkData!: Data;
  public nodes!: DataSet<Node>;
  public edges!: DataSet<Edge>;
  public visNetworkOptions!: Options;
  allNodes = [];
  allEdges = [];
  selectedNode = '';
  nodeOwners: NodeOwner[] = [];
  nodeOwners$: Observable<NodeOwner[]>;
  newSegments: any[] = [];
  participants: any;
  settings:SettingState;
  currentNodeInfo: any;
  subs = new Subscription();
  ringSettings$: Observable<RingSetting[]>;
  ringSettings: RingSetting;
  selectedIgniter: any;

  constructor(
    private visNetworkService: VisNetworkService,
    private ringData: RingDataService,
    private store: Store<fromRoot.State>,
    private toastService: ToastService
  ) {
    this.nodeOwners$ = this.store.pipe(select(selectNodeOwners));

    this.nodeOwners$.subscribe((data) => {
      this.nodeOwners = data;
    })

    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;
    });

    this.ringSettings$ = this.store.select(selectRingSettings);

    // this.ringSettings$.subscribe((data) => {
    //   this.ringSettings = data;
    // })

    this.viewMode = ringData.getViewMode();

  
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
        this.selectedNode = eventData[1].nodes[0];

        this.currentNodeInfo = this.ringData.getCachedNodeInfo(this.selectedNode);
      }
    });
  }

  public bestFit() {
    this.visNetworkService.bestFit(this.visNetwork, this.nodes);
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
    for (let node of this.nodeOwners) {
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

          this.edges.add(e);
        }
      }

    }
  }

  ngOnInit(): void {
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

  isRingLeader(no) {
    return this.ringData.getRingLeader() == no
  }

  public ngOnDestroy(): void {
    this.visNetworkService.off(this.visNetwork, 'click');
    this.subs.unsubscribe();
  }

 
  /* @TODO: Implemnent graph export, right-click save should work as well */
  exportGraph() {
    //this.visNetworkService.vis
  }

  reorderIgniter() {
    let idx = this.nodeOwners.indexOf(this.selectedIgniter);
    if (idx == -1) {
      this.toastService.show('No igniter selected', { classname: 'bg-danger' });
      return;
    }

    let partsUntilIgniter = this.nodeOwners.slice(0, (idx + 1));
    let partsFromIgniter = this.nodeOwners.slice((idx+1));
    let newOrder = partsFromIgniter.concat(partsUntilIgniter);
    try {
      this.store.dispatch(loadNodeOwners(newOrder))
      this.ringData.saveRingSettings(this.nodeOwners);
      this.toastService.show('Node reorder persisted', { classname: 'bg-success' });
    } catch (e) {
      this.toastService.show('Error reordering', { classname: 'bg-danger' });
    }
  }
}
