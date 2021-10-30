import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { RingParticipant } from '../model/ring_participant.model';
import { RingDataService } from '../services/ring-data.service';
import * as fromRoot from '../reducers';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { upsertChannel } from '../actions/channel.actions';
import { ChannelEdge } from '../model/channel_edge.model';
import { selectNodeInfos  } from '../selectors/node-info.selectors';
import { NodeInfo } from '../model/node_info.model';
import * as svg from 'save-svg-as-png';
import { selectSettings } from '../selectors/setting.selectors';
import { SettingState } from '../reducers/setting.reducer';

@Component({
  selector: 'app-watcher',
  templateUrl: './watcher.component.html',
  styleUrls: ['./watcher.component.scss']
})
export class WatcherComponent implements OnInit {
  viewMode: string;
  segments: CbNodeOwner[] = [];
  cbNodeOwners$: Observable<CbNodeOwner[]>
  ringLabels: string[];
  settings: SettingState;
  isReady:boolean = false;

  participants: RingParticipant[] = new Array<RingParticipant>();
  ndata = '';

  constructor(
    public ringData: RingDataService,
    private store: Store<fromRoot.State>
  ) {
    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;
      this.viewMode = settings.viewMode;
    });

    this.cbNodeOwners$.subscribe((data) => {
      this.segments = data;

      this.ringLabels = this.segments.map((val) => {
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
    return this.segments;
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
          return { name: val.user_name, active: false }
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

    this.ringLabels = this.segments.map((val) => {
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

//     this.isReady = true;
   // console.log("initialization ready");
  }

  getUsername(node: NodeInfo | undefined) {
    if (!node)
      return;

    let ret = this.segments.find((val) => {
      return val.pub_key == node.node.pub_key
    })

    if (ret.handle == "None") {
      return ret.user_name;
    }
    return `@${ret.handle}`;
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

  /* @TODO: Remove this, for testing channel updates. This does not seem to be the right way. */
  upsertPolicy() {
    this.store.select(selectNodeInfos)
      .subscribe((data) => {
        console.log(data);
      })


    let chan: ChannelEdge = {
      "channel_id": 776652133031018497,
      "chan_point": "64c712513e44befb22bff54a88e61229ecf7c9d3d87b31aaebedbe412dfc463c:1",
      "last_update": 1635186302,
      "node1_pub": "038b19417ee84b5469217efb333b677caec115e0298823e71148d2741b40cb62d1",
      "node2_pub": "03b364b19e60dcbc0063f0ea15e2cf87bdbc4ac9e4e898049652c3e8e3c04f3a6f",
      "capacity": 5000000,
      "node1_policy": {
        "time_lock_delta": 40,
        "min_htlc": 1000,
        "fee_base_msat": 1337,
        "fee_rate_milli_msat": 230,
        "max_htlc_msat": 4950000000,
        "last_update": 1635186302,
        "disabled": false
      },
      "node2_policy": {
        "time_lock_delta": 40,
        "min_htlc": 1000,
        "fee_rate_milli_msat": 1,
        "max_htlc_msat": 4950000000,
        "last_update": 1635185218,
        "fee_base_msat": 2442,
        "disabled": false
      }
    };

    this.store.dispatch(upsertChannel({ channel: chan }))

  }

  getColor(i) {
    let scale = this.ringData.getColorScale()(i);
    return scale;
  }

  getRingLabels() {
    return this.ringLabels;
  }

  downloadAsPng() {
    svg.saveSvgAsPng(document.getElementById("rofvisual").children[0], "ring-of-fire-visual.png", {
      backgroundColor: "#000",
      scale: 1.5,
      // fonts: [
      //   {
      //     url: '/assets/fonts/lato-v20-latin-regular.woff2',
      //     format: 'application/font-woff2',
      //     text: "@font-face { font-family: 'Lato'; font-style: normal; font-weight: 400; src: url('/assets/fonts/lato-v20-latin-regular.eot');  url('/assets/fonts/lato-v20-latin-regular.woff2') format('woff2');"
      //   }
      // ],
    })
  }

  downloadAsSvg() {
    svg.saveSvgAsPng(document.getElementById("rofvisual").children[0], "ring-of-fire-visual.png", {
      backgroundColor: "#000",
      scale: 1.5,
      // fonts: [
      //   {
      //     url: '/assets/fonts/lato-v20-latin-regular.woff2',
      //     format: 'application/font-woff2',
      //     text: "@font-face { font-family: 'Lato'; font-style: normal; font-weight: 400; src: url('/assets/fonts/lato-v20-latin-regular.eot');  url('/assets/fonts/lato-v20-latin-regular.woff2') format('woff2');"
      //   }
      // ],
    })
  }

}


