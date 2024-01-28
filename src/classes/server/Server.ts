import { createServer, Server as NetServer, Socket } from 'node:net';
import { Protocol } from '../protocol/Protocol';
import { MessageCode } from '../protocol/Message';

export abstract class Server {
  protected server: NetServer;
  protected protocol: Protocol;

  constructor() {
    this.protocol = new Protocol();
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
    socket.write(
      this.protocol.encode({
        code: MessageCode.REQUEST_PASSWORD,
      })
    );
  }
}
