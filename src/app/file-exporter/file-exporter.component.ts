import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadNodeOwners } from '../actions/node-owner.actions';
import { NodeOwner } from '../model/node_owner.model';
import * as fromRoot from '../reducers';
import { selectNodeOwners } from '../selectors/node-owner.selectors';
import { RingDataService } from '../services/ring-data.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-file-exporter',
  templateUrl: './file-exporter.component.html',
  styleUrls: ['./file-exporter.component.scss']
})
export class FileExporterComponent {
  nodeOwners: NodeOwner[] = [];
  nodeOwners$: Observable<NodeOwner[]>;

  constructor(
    private ringData: RingDataService,
    private store: Store<fromRoot.State>,
    private toastService: ToastService
  ) {
    this.nodeOwners$ = this.store.pipe(select(selectNodeOwners));

    this.nodeOwners$.subscribe((data) => {
      this.nodeOwners = data;
    })
  }

  persistOrder() {
    try {
      this.store.dispatch(loadNodeOwners(this.nodeOwners))
      this.ringData.saveRingSettings(this.nodeOwners);
      this.toastService.show('Node order persisted', { classname: 'bg-success' });
    } catch (e) {
      this.toastService.show('Error persisting order', { classname: 'bg-danger' });
    }
  }
  
    /* @TODO: Move to service and add igniter.sh generation */
    downloadChannelsTxt() {
      this.ringData.downloadChannelsTxt();
    }
  
    downloadPubKeysTxt() {
      this.ringData.downloadPubkeysTgTxt();
    }
  
    downloadIgniterPubkeys() {
      let igniterText = 'declare pub_keys=(\r\n';
  
      for (let s of this.nodeOwners) {
        let username = s.username;
  
        if (username == 'None')
          username = s.first_name
  
        igniterText += `    ${s.pub_key} # ${username}\r\n`
      }
  
      igniterText += ')'
  
      this.ringData.downloadFile(igniterText);
    }
  

}
