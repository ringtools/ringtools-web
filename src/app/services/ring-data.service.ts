import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RingDataService {
  segments = [ // format is <pubkey>,<tg username>
    ['0205a19356bbb7482057356aef070285a2ce6141d2448545210e9d575b57eddd37', '@dsbaars'],
    ['03e691f81f08c56fa876cc4ef5c9e8b727bd682cf35605be25d48607a802526053', '@kaaskoekje']
  ]

  nodeNames:Map<string, string> = new Map<string,string>();
  nodeToTgMap:Map<string, string> = new Map<string,string>();

  channels:any = [];

  viewMode = 'tg';

  constructor(
    private http: HttpClient
  ) { 
    this.populateTgMap();
    this.populateChannels();
  }

  populateTgMap() {
    for (let node of this.getSegments()) {
      this.nodeToTgMap.set(node[0], node[1]);
    }
  }

  repopulate() {
    this.channels = [];
    this.populateTgMap();
    this.populateChannels();
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

  getNodeInfo(pubkey: string) {
    return this.http.get(`http://localhost:8000/node/${pubkey}`);
  }

  populateChannels() {
    for (let [key, node] of this.getSegments().entries()) {
      this.getNodeInfo(node[0]).subscribe((data: any) => {
        if (!data)
          return;
        this.nodeNames.set(node[0], data.node.alias);

        for (let edge of data.channels) {
          let nextIndex = (key + 1) % this.getSegments().length;

          if (edge.node1_pub == this.getSegments()[nextIndex][0] || edge.node2_pub == this.getSegments()[nextIndex][0]) {
            edge.order = key;
            this.channels.push(edge)
            console.log();
          }
        }
      })
    };
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
