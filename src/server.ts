import { UNIXServer } from './classes/server/UNIXServer';
import { TCPServer } from './classes/server/TCPServer';
import { getInput } from './utils';

(async () => {
  const socketType = await getInput(
    'Choose client socket type',
    ['unix', 'tcp'],
    true
  );

  switch (socketType) {
    case 'unix':
      new UNIXServer();
      break;

    case 'tcp':
      new TCPServer();
      break;

    default:
      console.log('[SERVER] Not a valid socket type.');
  }
})();
