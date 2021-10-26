import { Component, ElementRef, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RingDataService } from '../services/ring-data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  viewMode = 'tg';
  fileUrl:any;

  constructor(
    private ringData: RingDataService,
    private sanitizer: DomSanitizer
    ){}

  ngOnInit(): void {
  }


  /* @TODO: Move to service and add igniter.sh generation */
  downloadChannelsTxt() {
    let data = '';
    
    for (let channel of this.ringData.getChannels()) {
      data += channel.channel_id + "\r\n";
    }

    const blob = new Blob([data], { type: 'application/octet-stream' });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }
}
