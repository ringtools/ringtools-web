import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { RingDataService } from '../services/ring-data.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  public isMenuCollapsed = false;
  ringName = '';

  links = [
    { title: 'Home', route: '' },
    { title: 'Design', route: 'design' },
    { title: 'Watch', route: 'watch' },
    { title: 'Settings', route: 'settings' }
  ];

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private ringData: RingDataService,
    ) { }

  ngOnInit(): void {
    this.ringName = this.ringData.getRingName();
  }

  getRingName() {
    return this.ringData.getRingName();
  }

}
