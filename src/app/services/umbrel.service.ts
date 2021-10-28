import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { selectSettings } from '../selectors/setting.selectors';
import { SettingState } from '../reducers/setting.reducer';
import { environment } from 'src/environments/environment';

/**
 * @FIXME: This service should allow for WebSocket server switching.
 */
@Injectable({
  providedIn: 'root'
})
export class UmbrelService {
  config: SocketIoConfig = {
    url: environment.WS_ENDPOINT ? environment.WS_ENDPOINT : "",
    options: {
      transports: ['websocket'],
      reconnection: true
    }
  };
  settings!: SettingState;

  constructor(
    private store: Store<fromRoot.State>,
    private socket: Socket
    ) {
    this.store.select(selectSettings).subscribe((settings) => {
      this.settings = settings;
    });

  //  this.socket = new Socket(this.config);

  }

  reconnectSocket() {
    this.socket.disconnect();
    this.config.url = this.settings.pubsubServer; 
    this.socket = new Socket(this.config);
  }
}