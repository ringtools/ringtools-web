import { Component } from '@angular/core';
import { env } from 'process';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // host: {
  //   class: appClass
  // }
})
export class AppComponent {
  title = 'RingTools';
  
}
