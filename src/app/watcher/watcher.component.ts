import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { NodeOwner } from '../model/node_owner.model';
import { RingParticipant } from '../model/ring_participant.model';
import { RingDataService } from '../services/ring-data.service';
import * as fromRoot from '../reducers';
import { selectNodeOwners } from '../selectors/node-owner.selectors';
import { NodeInfo } from '../model/node_info.model';
import * as svg from 'save-svg-as-png';
import { selectSettings } from '../selectors/setting.selectors';
import { SettingState } from '../reducers/setting.reducer';
import { getUsername } from '../utils/utils';

@Component({
  selector: 'app-watcher',
  templateUrl: './watcher.component.html',
  styleUrls: ['./watcher.component.scss']
})
export class WatcherComponent implements OnInit {
  viewMode: string;
  nodeOwners: NodeOwner[] = [];
  nodeOwners$: Observable<NodeOwner[]>
  ringLabels: string[];
  settings: SettingState;
  isReady:boolean = false;

  participants: RingParticipant[] = new Array<RingParticipant>();
  ndata = '';

  constructor(
    public ringData: RingDataService,
    private store: Store<fromRoot.State>
  ) {
    this.nodeOwners$ = this.store.pipe(select(selectNodeOwners));

    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;
      this.viewMode = settings.viewMode;
    });

    this.nodeOwners$.subscribe((data) => {
      this.nodeOwners = data;

      this.ringLabels = this.nodeOwners.map((val) => {
        if (this.viewMode == "node")
          return val.nodename;
        return this.ringData.getUsername(val.pub_key)
      })
    })
    this.viewMode = ringData.getViewMode();

    if (this.ringData.isLoaded) {
      this.createParticipants();
    } else {
      this.ringData.isReady$.pipe(take(1)).subscribe((d) => {
        this.createParticipants();
      })
    }

    this.ringData.channelUpdate$.subscribe((data) => {
      this.refreshParticipants();
    })
  }

  ngOnInit(): void {
  }

  getSegments() {
    return this.nodeOwners;
  }

  getIsReady() {
    return this.ringData.getIsLoaded();
  }

  getChartSegments() {
    if (!this.participants.length) {
      return this.getSegments().map((val, i) => {
        if (this.viewMode == "node")
          return { name: val.nodename, active: false }
        else
          return { name: val.first_name, active: false }
      })
    }
    let ret = this.participants.map((val, i) => {
      let isOk: boolean = Boolean(val.channel_id)
      return { name: this.ringLabels[i], active: isOk }
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

    this.ringLabels = this.nodeOwners.map((val) => {
      if (this.viewMode == "node")
        return val.nodename;
      return this.ringData.getUsername(val.pub_key)
    })
  }

  createParticipants() {
    if (this.participants.length) {
      return this.refreshParticipants();
    }

    for (let [i, node] of this.getSegments().entries()) {
      let nextIndex = (i + 1) % this.getSegments().length;
      let p: RingParticipant = {
        initiator: this.ringData.getNodeInfo(node.pub_key),
        receiver: this.ringData.getNodeInfo(this.getSegments()[nextIndex].pub_key)
      };

      if (p.initiator && p.receiver) {
        p.channel_id = this.ringData.nodeHasChannelWith(node.pub_key, this.getSegments()[nextIndex].pub_key);
        let t = this.ringData.getChannelPolicies(node.pub_key, this.getSegments()[nextIndex].pub_key);

        p.initiator_fee = t[0];
        p.receiver_fee = t[1];
        this.participants.push(p);
      }
    }
  }

  getUsername(node: NodeInfo | undefined) {  
    return getUsername(node, this.nodeOwners);
  }

  refreshParticipants() {
    for (let [i, p] of this.participants.entries()) {

      if (p.initiator && p.receiver) {
        let channel_id = this.ringData.nodeHasChannelWith(p.initiator.node.pub_key, p.receiver.node.pub_key);
        let t = this.ringData.getChannelPolicies(p.initiator.node.pub_key, p.receiver.node.pub_key);

        if (t) {
          p.initiator_fee = t[0];
          p.receiver_fee = t[1];
        }
      }
    }
  }

  getColor(i) {
    return this.ringData.getColorScale()(i);;
  }

  getRingLabels() {
    return this.ringLabels;
  }

  downloadAsPng() {
    let ringName = this.ringData.getRingName().replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();


    svg.saveSvgAsPng(document.getElementById("rofvisual").children[0], `${ringName}.png`, {
 //     backgroundColor: "#000",
      scale: 1.5,
    })
  }

  downloadAsSvg() {
    svg.saveSvgAsPng(document.getElementById("rofvisual").children[0], "ring-of-fire-visual.png", {
      backgroundColor: "#000",
      scale: 1.5,
    })
  }

}


