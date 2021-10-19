import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  public isMenuCollapsed = false;

  links = [
    { title: 'Home', route: '' },
    { title: 'Design', route: 'design' },
    { title: 'Settings', route: 'settings' }
  ];

  constructor(
    private router: Router,
    public route: ActivatedRoute
    ) { }

  ngOnInit(): void {

  }

}
