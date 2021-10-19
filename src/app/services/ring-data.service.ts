import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RingDataService {
  segments = [ // format is <pubkey>,<tg username>
    ['0205a19356bbb7482057356aef070285a2ce6141d2448545210e9d575b57eddd37', '@dsbaars']
  ]

  viewMode = 'tg';

  constructor(
    private http: HttpClient
  ) { }

  getSegments() {
    return this.segments;
  }

  setViewMode(viewMode: string) {
    this.viewMode = viewMode;
  }

  getViewMode() {
    return this.viewMode;
  }

  getNodeInfo(pubkey: string) {
    return this.http.get(`http://localhost:8000/node/${pubkey}`);
  }
}
