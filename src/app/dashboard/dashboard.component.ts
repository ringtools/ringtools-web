import { Component, ElementRef, OnInit } from '@angular/core';
import { RingDataService } from '../services/ring-data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  viewMode = 'tg';

  constructor(
    private ringData: RingDataService
    ){}

  ngOnInit(): void {
  }

  viewChange(event:any) {
    this.ringData.setViewMode(event);
  }
}
