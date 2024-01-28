import { config } from '../../config';
import { Server } from './Server';

export class UNIXServer extends Server {
  listen() {
    this.server.listen(config.unixSocketPath);
    console.log(
      `[SERVER] UNIX server listening at '${config.unixSocketPath}'.`
    );
  }
}
