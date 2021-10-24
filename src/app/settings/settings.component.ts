import { Component, OnInit } from '@angular/core';
import { RingDataService } from '../services/ring-data.service';
import ringInfo from '../data/ring.txt';
import { CbNodeOwner } from '../model/cb_node_owner.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  segments: CbNodeOwner[];
  pubkeysText:any = '';
  ringName:any = '';

  constructor(
    public ringData: RingDataService
  ) {
    this.segments = ringData.getSegments();
    this.pubkeysText = ringInfo;
    this.ringName = ringData.getRingName();
   }

  ngOnInit(): void {
  }

  getSegments() {
    return this.ringData.getSegments();
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
    let segments = this.ringData.parseCsvToType(this.pubkeysText);

    //console.log(segments);

    this.ringData.setSegments(segments);
    this.ringData.repopulate();
    //console.log(segments);
  }

  processRingname() {

    this.ringData.setRingName(this.ringName);
  }
}
