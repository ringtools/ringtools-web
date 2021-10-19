import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataSet } from 'vis-data';
import { Data, Edge, Options, Node } from 'vis-network';
import { RingDataService } from '../services/ring-data.service';
import { VisNetworkService } from '../vis/network/vis-network.service';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss']
})
export class DesignComponent implements OnInit, OnDestroy {
  public visNetwork: string = 'networkId1';
  public visNetworkData!: Data;
  public nodes!: DataSet<Node>;
  public edges!: DataSet<Edge>;
  public visNetworkOptions!: Options;
  allNodes = [];
  allEdges = [];
  selectedNode = '';

  constructor(
    private visNetworkService: VisNetworkService,
    private ringData: RingDataService,
    private http: HttpClient
  ) { }

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
      }
    });
  }

  buildNodes() {
    for (let node of this.ringData.getSegments()) {
      this.ringData.getNodeInfo(node[0]).subscribe((data: any) => {

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

            if (edge.disabled) {
              e.label = "disabled: true";
              e.color = "#ff0000";
            }

            this.edges.add(e);
          }
        }
      });
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
  }
}
