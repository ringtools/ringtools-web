import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadCbNodeOwners } from '../actions/cb-node-owner.actions';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import * as fromRoot from '../reducers';
import { selectCbNodeOwners } from '../selectors/cb-node-owner.selectors';
import { RingDataService } from '../services/ring-data.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-file-exporter',
  templateUrl: './file-exporter.component.html',
  styleUrls: ['./file-exporter.component.scss']
})
export class FileExporterComponent {
  cbNodeOwners: CbNodeOwner[] = [];
  cbNodeOwners$: Observable<CbNodeOwner[]>;


  constructor(
    private ringData: RingDataService,
    private store: Store<fromRoot.State>,
    private toastService: ToastService
  ) {
    this.cbNodeOwners$ = this.store.pipe(select(selectCbNodeOwners));

    this.cbNodeOwners$.subscribe((data) => {
      this.cbNodeOwners = data;
    })
  }

  persistOrder() {
    try {
      this.store.dispatch(loadCbNodeOwners(this.cbNodeOwners))
      this.ringData.saveRingSettings(this.cbNodeOwners);
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
  
      for (let s of this.cbNodeOwners) {
        let handle = s.handle;
  
        if (handle == 'None')
          handle = s.user_name
  
        igniterText += `    ${s.pub_key} # ${handle}\r\n`
      }
  
      igniterText += ')'
  
      this.ringData.downloadFile(igniterText);
    }
  

}
