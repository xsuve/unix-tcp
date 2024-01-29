import { UNIXClient } from './classes/client/UNIXClient';
import { TCPClient } from './classes/client/TCPClient';
import { getInput } from './utils';

(async () => {
  const socketType = await getInput('Choose client socket type', [
    'unix',
    'tcp',
  ]);

  switch (socketType) {
    case 'unix':
      new UNIXClient();
      break;

    case 'tcp':
      new TCPClient();
      break;

    default:
      console.log('[CLIENT] Not a valid socket type.');
  }
})();
