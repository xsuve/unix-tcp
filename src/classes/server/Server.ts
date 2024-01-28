import { createServer, Server as NetServer, Socket } from 'node:net';

export abstract class Server {
  protected server: NetServer;

  constructor() {
    this.server = createServer();
    this.listen();

    this.server.on('connection', (socket: Socket) => this.onConnection(socket));

    this.server.on('error', (error: Error) => {
      console.log(`[SERVER] Error: ${error.message}`);
      process.exit(0);
    });
  }

  protected abstract listen(): void;

  protected onConnection(socket: Socket) {
    console.log('[SERVER] New client connected to server.');
  }
}
