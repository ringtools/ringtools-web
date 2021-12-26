import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { Observable, Subscription } from 'rxjs';
import { loadCbNodeOwners } from '../actions/cb-node-owner.actions';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { RingSetting } from '../model/ring-setting.model';
import { SettingState } from '../reducers/setting.reducer';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { selectRingSettings } from '../selectors/ring-setting.selectors';
import { selectSettings } from '../selectors/setting.selectors';
import { RingDataService } from '../services/ring-data.service';
import { ToastService } from '../toast/toast.service';
import { VisNetworkService } from '../vis/vis.module';
import createLayout from 'ngraph.forcelayout';
import createGraph, { Graph } from 'ngraph.graph';
import Viva from 'vivagraphjs';
import G6 from '@antv/g6';

import eventify from 'ngraph.events';
import { nodeInfoesFeatureKey } from '../reducers/node-info.reducer';

@Component({
  selector: 'app-visual',
  templateUrl: './visual.component.html',
  styleUrls: ['./visual.component.scss'],
})
export class VisualComponent implements OnInit {
  viewMode!: string;
  nodes: any[] = [];
  edges: any[] = [];
  cbNodeOwners: CbNodeOwner[] = [];
  cbNodeOwners$: Observable<CbNodeOwner[]>;
  newSegments: any[] = [];
  participants: any;
  settings: SettingState;
  currentNodeInfo: any;
  subs = new Subscription();
  ringSettings$: Observable<RingSetting[]>;
  ringSettings: RingSetting;
  selectedIgniter: any;
  g: Graph;

  constructor(
    private ringData: RingDataService,
    private store: Store<fromRoot.State>,
    private toastService: ToastService
  ) {
    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.cbNodeOwners$.subscribe((data) => {
      this.cbNodeOwners = data;
    });

    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;
    });

    this.ringSettings$ = this.store.select(selectRingSettings);

    this.viewMode = ringData.getViewMode();

    this.g = Viva.Graph.graph();
  }

  viewChange(event: any) {
    this.ringData.setViewMode(event);
    this.refreshNodes();
  }

  public networkInitialized(): void {}

  public bestFit() {
    //    this.visNetworkService.bestFit(this.visNetwork, this.nodes);
  }

  refreshNodes() {}

  getLabel(n) {
    if (this.viewMode == 'node') {
      return this.ringData.getTgUserByPubkey(n).nodename;
    } else {
      return this.ringData.getUsername(n);
    }
  }

  buildNodes() {
    let nodeIds = [];

    for (let node of this.cbNodeOwners) {
      let data = this.ringData.getNodeInfo(node.pub_key);
      if (!data) break;

      let label;

      if (this.viewMode == 'node') {
        label = this.ringData.getTgUserByPubkey(data.node.pub_key).nodename;
      } else {
        label = this.ringData.getUsername(data.node.pub_key);
      }

      let nodeInfo: any = {
        id: data.node.pub_key,
        color: data.node.color,
        label: this.getLabel(data.node.pub_key),
        style: {
          fill: data.node.color
        }
      };

      this.nodes.push(nodeInfo);
      nodeIds.push(nodeInfo.id);

      for (let edge of data.channels) {
        if (
          nodeIds.find((n) => n == edge.node1_pub) &&
          nodeIds.find((n) => n == edge.node2_pub)
        ) {
          let e: any = {
            id: edge.channel_id,
            from: edge.node1_pub,
            to: edge.node2_pub,
            label: edge.channel_id,
            dashes: true,
          };

          if (!edge.node1_policy || !edge.node2_policy) {
            e.label = 'no info';
            e.color = '#ffcc00';
          }

          this.edges.push({ source: e.from, target: e.to, label: e.label, e });
        }
      }
    }

    const globalFontSize = 12;

    const container = document.getElementById('graphContainer');
    const width = container.scrollWidth;
    const height = container.scrollHeight || 600;
    const graph = new G6.Graph({
      container: container,
      width,
      height,
      fitCenter: true,
   //   linkCenter: true,
      modes: {
        default: ['drag-canvas', 'drag-node'],
      },
      layout: {
        type: 'radial',
        center: [0, 0], // The center of the graph by default
        linkDistance: 450, // The edge length
        preventOverlap: true, // nodeSize or size in data is required for preventOverlap: true
        strictRadial: true
      },
      animate: true,
      defaultNode: {
        type: 'ellipse',
        size: [80, 30],
        labelCfg: {
          style: {
            fontSize: globalFontSize,
            
          },
        },
      },
      defaultEdge: {
        type: 'cubic',
        /* you can configure the global edge style as following lines */
        // style: {
        //   stroke: '#F6BD16',
        // },
//        controlPoints: [{ x: 100, y: 100 }, { x: 100, y: 100 }],
        labelCfg: {
          autoRotate: true,
          refY: -10,
        },
       
      },
    });
    graph.data({ nodes: this.nodes, edges: this.edges });
    graph.render();
  }

  ngOnInit(): void {
    if (this.ringData.isLoaded) {
      this.buildNodes();
    } else {
      this.ringData.isReady$.subscribe(() => {
        this.buildNodes();
      });
    }



  }

  isRingLeader(no) {
    return this.ringData.getRingLeader() == no;
  }

  public ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  persistOrder() {
    try {
      this.store.dispatch(loadCbNodeOwners(this.cbNodeOwners));
      this.ringData.saveRingSettings(this.cbNodeOwners);
      this.toastService.show('Node order persisted', {
        classname: 'bg-success',
      });
    } catch (e) {
      this.toastService.show('Error persisting order', {
        classname: 'bg-danger',
      });
    }
  }

  /* @TODO: Implemnent graph export, right-click save should work as well */
  exportGraph() {
    //this.visNetworkService.vis
  }

  reorderIgniter() {
    let idx = this.cbNodeOwners.indexOf(this.selectedIgniter);
    if (idx == -1) {
      this.toastService.show('No igniter selected', { classname: 'bg-danger' });
      return;
    }

    let partsUntilIgniter = this.cbNodeOwners.slice(0, idx + 1);
    let partsFromIgniter = this.cbNodeOwners.slice(idx + 1);
    let newOrder = partsFromIgniter.concat(partsUntilIgniter);
    try {
      this.store.dispatch(loadCbNodeOwners(newOrder));
      this.ringData.saveRingSettings(this.cbNodeOwners);
      this.toastService.show('Node reorder persisted', {
        classname: 'bg-success',
      });
    } catch (e) {
      this.toastService.show('Error reordering', { classname: 'bg-danger' });
    }
  }
}
