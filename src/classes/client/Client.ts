import { Socket } from 'node:net';
import { Protocol } from '../protocol/Protocol';

export abstract class Client {
  protected abstract client: Socket;
  protected protocol: Protocol;

  constructor() {
    this.protocol = new Protocol();
  }

  protected onConnect() {
    console.log('[CLIENT] Client connected to server.');
  }

  protected onData(buffer: Buffer) {
    const message = this.protocol.decode(buffer);
    console.log('[CLIENT] Message:', message);
  }
}
