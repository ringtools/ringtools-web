import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { firstValueFrom, Observable, take } from 'rxjs';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { RingParticipant } from '../model/ring_participant.model';
import { RoutingPolicy } from '../model/routing_policy.model';
import { RingDataService } from '../services/ring-data.service';
import * as fromRoot from '../reducers';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { upsertChannel } from '../actions/channel.actions';
import { ChannelEdge } from '../model/channel_edge.model';
import { selectAllNodeInfoPubkey, selectNodeInfoId } from '../reducers/node-info.reducer';
import { selectNodeByPubKey, selectNodeInfos, selectNodeInfosPubkey } from '../selectors/node-info.selectors';

@Component({
  selector: 'app-watcher',
  
  templateUrl: './watcher.component.html',
  styleUrls: ['./watcher.component.scss']
})
export class WatcherComponent implements OnInit {
  viewMode: string;
  segments: CbNodeOwner[] = [];
  cbNodeOwners$: Observable<CbNodeOwner[]>
  
  participants: RingParticipant[] = new Array<RingParticipant>();
  ndata = '';

  constructor(
    public ringData: RingDataService,
    private store: Store<fromRoot.State>

  ) {
    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.cbNodeOwners$.subscribe((data) => {
      this.segments = data;
    })
    this.viewMode = ringData.getViewMode();

    
    

    this.cbNodeOwners$.pipe(take(1)).subscribe((d) => {
    //  console.log(d);
      this.createParticipants();
    })

    this.ringData.channelUpdate$.subscribe((data) => {
      this.refreshParticipants();
    })
  }

  ngOnInit(): void {
  }

  getSegments() {
    return this.segments;
  }

  getChartSegments() {
    if (!this.participants.length) {
      return this.getSegments().map((val) => {
        return { name: val.user_name, active: false }
      })
    }
//(val.channel_id && val.initiator_fee && val.receiver_fee ? 1 : 0) 
    let ret = this.participants.map((val, i) => {
      let isOk:boolean = Boolean(val.channel_id && val.initiator_fee && val.receiver_fee)
     // console.log(val.initiator.node.alias, isOk);
      return { name: val.initiator?.node.alias, active: isOk  }
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
        p.receiver_fee =  t[1];
        this.participants.push(p);
      }
    }
  }

  refreshParticipants() {
    for (let [i, p] of this.participants.entries()) {

      if (p.initiator && p.receiver) {
        let channel_id = this.ringData.nodeHasChannelWith(p.initiator.node.pub_key, p.receiver.node.pub_key);
        let t = this.ringData.getChannelPolicies(p.initiator.node.pub_key, p.receiver.node.pub_key);

//      p.initiator?.hasChannelWith(p.receiver?.node.pub_key);
  //    let t = p.initiator?.getChannelPolicies(p.receiver?.node.pub_key);

        if (t) {
          p.initiator_fee = t[0];
          p.receiver_fee =  t[1];
        }
      }
    }
  }

  upsertPolicy() {
    this.store.select(selectNodeInfos) //({ pub_key: "038b19417ee84b5469217efb333b677caec115e0298823e71148d2741b40cb62d1"}))
    .subscribe((data) => {
      console.log(data);
    })


    let chan:ChannelEdge =  {
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

    this.store.dispatch(upsertChannel({ channel: chan}))

  }

  getColor(i) {
    let scale = this.ringData.getColorScale()(i);
    return scale;
  }

}

 
