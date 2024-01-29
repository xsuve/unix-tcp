import { Socket } from 'node:net';
import { Protocol } from '../protocol/Protocol';
import { Message, MessageCode } from '../protocol/Message';
import { Errors } from '../protocol/Error';
import { getInput } from '../../utils';
import { config } from '../../config';

export abstract class Client {
  protected abstract socket: Socket;
  protected protocol: Protocol;

  private playerId: string | null;

  constructor() {
    this.protocol = new Protocol();

    this.playerId = null;
  }

  private send(socket: Socket, message: Message) {
    socket.write(this.protocol.encode(message));
  }

  protected onConnect() {
    console.log('[CLIENT] Client connected to server.');
  }

  protected async receive(buffer: Buffer) {
    const message = this.protocol.decode(buffer);
    // console.log('[CLIENT] Message from server:', message);

    await this.handleServerMessage(message);
  }

  private async handleServerMessage(message: Message) {
    switch (message.code) {
      case MessageCode.REQUEST_PASSWORD:
        const password = await getInput('Type the password');

        this.send(this.socket, {
          code: MessageCode.SEND_PASSWORD,
          password,
        });
        break;

      case MessageCode.INVALID_PASSWORD:
        console.log('[CLIENT]', Errors[message.errorCode!]);
        this.socket.end();
        break;

      case MessageCode.VALID_PASSWORD:
        this.playerId = message.playerA!;

        this.send(this.socket, {
          code: MessageCode.REQUEST_OPPONENTS,
          playerA: this.playerId,
        });
        break;

      case MessageCode.OPPONENTS_LIST:
        {
          const { opponentId, word } = await this.chooseOpponent(
            message.opponents!.split(',')
          ); // TODO

          this.send(this.socket, {
            code: MessageCode.REQUEST_MATCH,
            playerA: this.playerId!,
            playerB: opponentId,
            word,
          });
        }
        break;

      case MessageCode.NO_OPPONENTS:
        console.log('[CLIENT]', Errors[message.errorCode!]);
        break;

      case MessageCode.REJECT_MATCH:
        {
          console.log('[CLIENT]', Errors[message.errorCode!]);

          const { opponentId, word } = await this.chooseOpponent(
            message.opponents!.split(',')
          ); // TODO

          this.send(this.socket, {
            code: MessageCode.REQUEST_MATCH,
            playerA: this.playerId!,
            playerB: opponentId,
            word,
          });
        }
        break;

      case MessageCode.REQUEST_WORD:
        const word = await getInput(
          `(${message.playerA}) Guess word / Give up (${config.giveUpWord})`
        );

        this.send(this.socket, {
          code: MessageCode.CHECK_WORD,
          playerB: this.playerId!,
          playerA: message.playerA,
          word,
        });

        break;

      case MessageCode.INFORM_ATTEMPT:
        console.log('[CLIENT] Attempt:', message.word);
        break;

      case MessageCode.REQUEST_HINT:
        const hint = await getInput(`(${message.playerB}) Give hint`);

        this.send(this.socket, {
          code: MessageCode.SEND_HINT,
          playerB: message.playerB,
          hint,
        });
        break;

      case MessageCode.SHOW_HINT:
        {
          console.log('[CLIENT] Hint:', message.hint);

          const guess = await getInput(`(${message.playerA}) Guess word`);

          this.send(this.socket, {
            code: MessageCode.CHECK_WORD,
            playerB: this.playerId!,
            playerA: message.playerA,
            word: guess,
          });
        }
        break;

      case MessageCode.SEND_END_MATCH:
        if (!message.status && message.word) {
          console.log(
            '[CLIENT]',
            Errors[message.errorCode!],
            'The word was:',
            message.word
          );
        } else {
          console.log('[CLIENT]', Errors[message.errorCode!]);
        }

        process.exit(0);
    }
  }

  private async chooseOpponent(opponents: string[]) {
    const opponentId = await getInput('Choose opponent', opponents);

    const word = await getInput('Choose word to guess');

    return { opponentId, word };
  }
}
