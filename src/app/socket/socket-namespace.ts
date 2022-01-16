import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

export class SocketNameSpace extends Socket {
  constructor(namespace: string) {
    const baseUrl = environment.WS_ENDPOINT ? environment.WS_ENDPOINT : '';
    let socketConfig = {
      url: `${baseUrl}/${namespace}`,
      options: {
        transports: ['websocket'],
        reconnection: true,
      },
    };
    super(socketConfig);
  }
}
