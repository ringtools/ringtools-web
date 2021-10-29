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
    ){}

  ngOnInit(): void {
  }

}
