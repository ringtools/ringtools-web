import { Component, OnInit } from '@angular/core';
import { RingDataService } from '../services/ring-data.service';

@Component({
  selector: 'app-stats-table',
  templateUrl: './stats-table.component.html',
  styleUrls: ['./stats-table.component.scss']
})
export class StatsTableComponent implements OnInit {
  segments: string[][];
  viewMode: string;
  pubkeysText = '';

  constructor(
    public ringData: RingDataService
  ) { 
    this.segments = ringData.getSegments();
    this.viewMode = ringData.getViewMode();
  }

  ngOnInit(): void {
  }

  getSegments() {
    return this.ringData.getSegments();
  }

  getChannels() {
    return this.ringData.getChannels();
  }

  getAlias(pubkey:string) {
    return this.ringData.getAliasByPubkey(pubkey);
  }

  getUsername(pubkey:string) {
    return this.ringData.getTgUserByPubkey(pubkey);
  }

  processPubkeys() {
    let segmentLines = this.pubkeysText.split('\n');
    let segments:any = [];
    for (let line of segmentLines) {
      segments.push(line.split(','));
    }

    this.ringData.setSegments(segments);
    this.ringData.repopulate();
    //console.log(segments);
  }

  processGroupnodes() {
    let segmentLines = this.pubkeysText.split('\n');
    let segments:any = [];
    for (let line of segmentLines.slice(1)) {
      let parts = line.split(',');
      segments.push([parts[2], parts[0]]);
    }

    console.log(segments);

    this.ringData.setSegments(segments);
    this.ringData.repopulate();
    //console.log(segments);
  }
}
