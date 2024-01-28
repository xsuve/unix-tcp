import { Socket } from 'node:net';

export abstract class Client {
  protected abstract client: Socket;

  protected onConnect() {
    console.log('[CLIENT] Client connected to server.');
  }
}
