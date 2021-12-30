import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { select } from 'd3';
import { Observable, take } from 'rxjs';
import { NodeOwner } from '../model/node_owner.model';
import { RingParticipant } from '../model/ring_participant.model';
import { SettingState } from '../reducers/setting.reducer';
import { selectNodeOwners } from '../selectors/node-owner.selectors';
import { selectSettings } from '../selectors/setting.selectors';
import { RingDataService } from '../services/ring-data.service';
import * as fromRoot from '../reducers';
import { getUsername, stringToBoolean } from '../utils/utils';
import { NodeInfo } from '../model/node_info.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ring-only',
  templateUrl: './ring-only.component.html',
  styleUrls: ['./ring-only.component.scss']
})
export class RingOnlyComponent  {
  viewMode: string;
  nodeOwners: NodeOwner[] = [];
  nodeOwners$: Observable<any>
  ringLabels: string[];
  settings: SettingState;
  isReady:boolean = false;
  onFire:boolean = true;
  withArrow:boolean = false;

  participants: RingParticipant[] = new Array<RingParticipant>();
  ndata = '';
  
  constructor(
    public ringData: RingDataService,
    private route: ActivatedRoute,
    private store: Store<fromRoot.State>
  ) {
    const onFire = this.route.snapshot.queryParamMap.get('onFire');
    const withArrow = this.route.snapshot.queryParamMap.get('withArrow');

    if (onFire) {
      this.onFire = stringToBoolean(onFire);
    }

    if (withArrow) {
      this.withArrow = stringToBoolean(withArrow);
    }

    this.nodeOwners$ = this.store.select(selectNodeOwners);

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

    if (this.ringData.isLoaded) {
      this.createParticipants();
    } else {
      this.ringData.isReady$.pipe(take(1)).subscribe((d) => {
        this.createParticipants();
      })
    }
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

    if (ret.filter(p => p.active).length == this.participants.length) {
      this.onFire = true;
    }

    return ret;
  }

  getRingName() {
    return this.ringData.getRingName();
  }

  getParticipants() {
    return this.participants;
  }

  createParticipants() {
    if (this.participants.length) {
//      return this.refreshParticipants();
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

  getColor(i) {
    return this.ringData.getColorScale()(i);;
  }

  getRingLabels() {
    return this.ringLabels;
  }
}
