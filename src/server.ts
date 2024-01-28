import { createInterface } from 'readline/promises';
import { stdin, stdout } from 'node:process';
import { UNIXServer } from './classes/server/UNIXServer';
import { TCPServer } from './classes/server/TCPServer';

(async () => {
  const readline = createInterface({ input: stdin, output: stdout });

  const socketType = await readline.question(
    '[SERVER] Choose server socket type (unix / tcp): '
  );

  switch (socketType) {
    case 'unix':
      const unixServer = new UNIXServer();
      break;

    case 'tcp':
      const tcpServer = new TCPServer();
      break;

    default:
      console.log('[SERVER] Not a valid socket type.');
  }
})();
