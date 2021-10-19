import { Component, OnInit } from '@angular/core';
import { RingDataService } from '../services/ring-data.service';

@Component({
  selector: 'app-stats-table',
  templateUrl: './stats-table.component.html',
  styleUrls: ['./stats-table.component.scss']
})
export class StatsTableComponent implements OnInit {
  segments: string[][];
  viewMode: string;

  constructor(
    public ringData: RingDataService
  ) { 
    this.segments = ringData.getSegments();
    this.viewMode = ringData.getViewMode();
  }

  ngOnInit(): void {
  }

  getSegments() {
    return this.ringData.getSegments();
  }
}
