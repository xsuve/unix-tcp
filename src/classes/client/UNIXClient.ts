import { Socket, createConnection } from 'node:net';
import { config } from '../../config';
import { Client } from './Client';

export class UNIXClient extends Client {
  socket: Socket;

  constructor() {
    super();
    this.socket = createConnection(config.unixSocketPath);

    this.socket.on('connect', () => this.onConnect());

    this.socket.on('data', (buffer: Buffer) => this.receive(buffer));
  }
}
