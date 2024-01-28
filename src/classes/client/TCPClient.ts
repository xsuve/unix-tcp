import { Socket, createConnection } from 'node:net';
import { config } from '../../config';
import { Client } from './Client';

export class TCPClient extends Client {
  client: Socket;

  constructor() {
    super();
    this.client = createConnection({
      host: config.tcpHost,
      port: config.tcpPort,
    });

    this.client.on('connect', () => this.onConnect());
  }
}
