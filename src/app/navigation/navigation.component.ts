import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RingDataService } from '../services/ring-data.service';
import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { Observable } from 'rxjs';
import { RingSetting } from '../model/ring-setting.model';
import { selectRingSettings } from '../selectors/ring-setting.selectors';

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
  ringSettings$: Observable<RingSetting[]>;
  ringSettings: RingSetting[] = [];

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private ringData: RingDataService,
    private store: Store<fromRoot.State>,
  ) {
    this.ringSettings$ = this.store.select(selectRingSettings);
  }

  ngOnInit(): void {
    this.ringName = this.ringData.getRingName();
  }

  getRingName() {
    return this.ringData.getRingName();
  }

  loadSettings(item) {
    this.ringData.loadSettings(item);
  }

}
