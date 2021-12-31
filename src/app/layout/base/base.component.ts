import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseLayoutComponent implements OnInit {
  networkClass = environment.networkClass

  constructor() { }

  ngOnInit(): void {
  }

}
