import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { RingParticipant } from '../model/ring_participant.model';
import { RoutingPolicy } from '../model/routing_policy.model';
import { RingDataService } from '../services/ring-data.service';

@Component({
  selector: 'app-watcher',
  
  templateUrl: './watcher.component.html',
  styleUrls: ['./watcher.component.scss']
})
export class WatcherComponent implements OnInit {
  viewMode: string;
  segments: CbNodeOwner[];

  participants: RingParticipant[] = new Array<RingParticipant>();

  constructor(
    public ringData: RingDataService
  ) {
    this.segments = ringData.getSegments();
    this.viewMode = ringData.getViewMode();
    this.createParticipants();

    this.ringData.channelUpdate$.subscribe((data) => {
      this.refreshParticipants();
    })
  }

  ngOnInit(): void {
  }

  getSegments() {
    return this.ringData.getSegments();
  }

  getChartSegments() {
    if (!this.participants.length) {
      return this.segments.map((val) => {
        return { name: val.user_name, active: false }
      })
    }
//(val.channel_id && val.initiator_fee && val.receiver_fee ? 1 : 0) 
    let ret = this.participants.map((val, i) => {
      let isOk:boolean = Boolean(val.channel_id && val.initiator_fee && val.receiver_fee)
     // console.log(val.initiator.node.alias, isOk);
      return { name: val.initiator.node.alias, active: isOk  }
    });

    return ret;
  }

  getRingName() {
    return this.ringData.getRingName();
  }

  getParticipants() {
    return this.participants;
  }

  viewChange(event: any) {
    this.ringData.setViewMode(event);
  }

  async createParticipants() {
    for (let [i, node] of this.segments.entries()) {
      let nextIndex = (i + 1) % this.segments.length;
      let p: RingParticipant = {
        initiator: await firstValueFrom(this.ringData.getNodeInfo(node.pub_key)),
        receiver: await firstValueFrom(this.ringData.getNodeInfo(this.segments[nextIndex].pub_key))
      };

      p.channel_id = this.ringData.nodeHasChannelWith(node.pub_key, this.segments[nextIndex].pub_key);
      let t = this.ringData.getChannelPolicies(node.pub_key, this.segments[nextIndex].pub_key);

      p.initiator_fee = t[0];
      p.receiver_fee =  t[1];
      this.participants.push(p);
    }
  }

  refreshParticipants() {
    for (let [i, p] of this.participants.entries()) {

      let channel_id = this.ringData.nodeHasChannelWith(p.initiator.node.pub_key, p.receiver.node.pub_key);
      let t = this.ringData.getChannelPolicies(p.initiator.node.pub_key, p.receiver.node.pub_key);

      p.initiator_fee = t[0];
      p.receiver_fee =  t[1];
    }
  }

  getColor(i) {
    let scale = this.ringData.getColorScale()(i);
    return scale;
  }

}
