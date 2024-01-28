import { config } from '../../config';
import { Server } from './Server';

export class TCPServer extends Server {
  listen() {
    this.server.listen(config.tcpPort, config.tcpHost);
    console.log(
      `[SERVER] TCP server listening on ${config.tcpHost}:${config.tcpPort}.`
    );
  }
}
