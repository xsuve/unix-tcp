import { createInterface } from 'readline/promises';
import { stdin, stdout } from 'node:process';
import { UNIXClient } from './classes/client/UNIXClient';
import { TCPClient } from './classes/client/TCPClient';

(async () => {
  const readline = createInterface({ input: stdin, output: stdout });

  const socketType = await readline.question(
    '[CLIENT] Choose client socket type (unix / tcp): '
  );

  switch (socketType) {
    case 'unix':
      const unixClient = new UNIXClient();
      break;

    case 'tcp':
      const tcpClient = new TCPClient();
      break;

    default:
      console.log('[CLIENT] Not a valid socket type.');
  }
})();
