import { Socket, createConnection } from 'node:net';
import { config } from '../../config';
import { Client } from './Client';

export class UNIXClient extends Client {
  client: Socket;

  constructor() {
    super();
    this.client = createConnection(config.unixSocketPath);

    this.client.on('connect', () => this.onConnect());

    this.client.on('data', (buffer: Buffer) => this.onData(buffer));
  }
}
