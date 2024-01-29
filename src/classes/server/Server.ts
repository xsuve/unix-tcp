import { createServer, Server as NetServer, Socket } from 'node:net';
import { Protocol } from '../protocol/Protocol';
import { Message, MessageCode } from '../protocol/Message';
import { config } from '../../config';
import { ErrorCode } from '../protocol/Error';

type Match = {
  playerA: string;
  playerB: string;
  word: string;
  attempts: number;
};

type Player = {
  socket: Socket;
  playerId: string;
};

export abstract class Server {
  protected server: NetServer;
  protected protocol: Protocol;

  private players: Player[];
  private matches: Match[];

  constructor() {
    this.players = [];
    this.matches = [];

    this.protocol = new Protocol();
    this.server = createServer();
    this.listen();

    this.server.on('connection', (socket: Socket) => {
      socket.on('data', (buffer: Buffer) => this.receive(socket, buffer));

      socket.on('end', () => {
        console.log('[SERVER] Client disconnected from server.');
      });

      this.onConnection(socket);
    });

    this.server.on('error', (error: Error) => {
      console.log('[SERVER] Error:', error.message);
      process.exit(0);
    });
  }

  protected abstract listen(): void;

  private send(socket: Socket, message: Message) {
    socket.write(this.protocol.encode(message));
  }

  protected onConnection(socket: Socket) {
    console.log('[SERVER] New client connected to server.');
    this.send(socket, {
      code: MessageCode.REQUEST_PASSWORD,
    });
  }

  private receive(socket: Socket, buffer: Buffer) {
    const message = this.protocol.decode(buffer);
    // console.log('[SERVER] Message from client:', message);

    this.handleClientMessage(socket, message);
  }

  private handleClientMessage(socket: Socket, message: Message) {
    switch (message.code) {
      case MessageCode.SEND_PASSWORD:
        if (message.password && message.password === config.password) {
          const playerId = this.generatePlayerId();

          this.players.push({ socket, playerId });

          this.send(socket, {
            code: MessageCode.VALID_PASSWORD,
            playerA: playerId,
          });
        } else {
          this.send(socket, {
            code: MessageCode.INVALID_PASSWORD,
            errorCode: ErrorCode.INVALID_PASSWORD_ERROR,
          });
        }
        break;

      case MessageCode.REQUEST_OPPONENTS:
        const opponents = this.players.filter(
          (player) => player.playerId !== message.playerA
        );

        if (opponents.length) {
          this.send(socket, {
            code: MessageCode.OPPONENTS_LIST,
            opponents: opponents.map((opponent) => opponent.playerId).join(','), // TODO
          });
        } else {
          this.send(socket, {
            code: MessageCode.NO_OPPONENTS,
            errorCode: ErrorCode.NO_OPPONENTS_AVAILABLE,
          });
        }
        break;

      case MessageCode.REQUEST_MATCH:
        const opponent = this.players.find(
          (player) => player.playerId === message.playerB
        );

        const isInMatch = this.matches.find(
          (match) => match.playerB === message.playerB
        );

        if (opponent && !isInMatch) {
          this.matches.push({
            playerA: message.playerA!,
            playerB: message.playerB!,
            word: message.word!,
            attempts: 0,
          });

          // Opponent
          this.send(opponent.socket, {
            code: MessageCode.REQUEST_WORD,
            playerA: message.playerA!,
          });
        } else {
          const opponents = this.players.filter(
            (player) => player.playerId !== message.playerA
          );

          this.send(socket, {
            code: MessageCode.REJECT_MATCH,
            opponents: opponents.map((opponent) => opponent.playerId).join(','), // TODO
            errorCode: isInMatch
              ? ErrorCode.OPPONENT_UNAVAILABLE_ERROR
              : ErrorCode.INVALID_OPPONENT_ERROR,
          });
        }
        break;

      case MessageCode.CHECK_WORD:
        const match = this.matches.find(
          (match) =>
            match.playerA === message.playerA &&
            match.playerB === message.playerB
        );

        if (match) {
          const playerASocket = this.players.find(
            (player) => player.playerId === match.playerA
          ); // playerA - opponent
          const playerBSocket = this.players.find(
            (player) => player.playerId === match.playerB
          );

          if (playerASocket && playerBSocket) {
            if (message.word !== config.giveUpWord) {
              if (message.word === match.word) {
                this.send(playerASocket.socket, {
                  code: MessageCode.SEND_END_MATCH,
                  status: true,
                  errorCode: ErrorCode.PLAYER_GUESSED_WORD,
                });

                this.send(playerBSocket.socket, {
                  code: MessageCode.SEND_END_MATCH,
                  status: true,
                  errorCode: ErrorCode.YOU_GUESSED_WORD,
                });

                this.matches = this.matches.filter(
                  (match) =>
                    match.playerA === message.playerA &&
                    match.playerB === message.playerB
                );

                this.players = this.players.filter(
                  (player) =>
                    player.playerId !== message.playerA &&
                    player.playerId !== message.playerB
                );
              } else {
                match.attempts++;

                if (match.attempts < config.maxAttemptsBeforeHint) {
                  this.send(playerBSocket.socket, {
                    code: MessageCode.REQUEST_WORD,
                    playerA: match.playerA,
                  });

                  this.send(playerASocket.socket, {
                    code: MessageCode.INFORM_ATTEMPT,
                    word: message.word,
                  });
                } else {
                  this.send(playerASocket.socket, {
                    code: MessageCode.REQUEST_HINT,
                    playerA: match.playerA,
                    playerB: match.playerB,
                  });

                  // this.send(opponentSocket.socket, {
                  //   code: MessageCode.REQUEST_WORD,
                  //   clientId: match.playerA,
                  // });
                }
              }
            } else {
              this.send(playerASocket.socket, {
                code: MessageCode.SEND_END_MATCH,
                status: false,
                errorCode: ErrorCode.OPPONENT_GAVE_UP,
              });

              this.send(playerBSocket.socket, {
                code: MessageCode.SEND_END_MATCH,
                status: false,
                errorCode: ErrorCode.YOU_GAVE_UP,
                word: match.word,
              });

              this.matches = this.matches.filter(
                (match) =>
                  match.playerA === message.playerA &&
                  match.playerB === message.playerB
              );

              this.players = this.players.filter(
                (player) =>
                  player.playerId !== message.playerA &&
                  player.playerId !== message.playerB
              );
            }
          }
        }
        break;

      case MessageCode.SEND_HINT:
        {
          const opponent = this.players.find(
            (player) => player.playerId === message.playerB!
          );

          if (opponent) {
            const match = this.matches.find(
              (match) => match.playerB === opponent.playerId
            );

            if (match) {
              match.attempts = 0;

              this.send(opponent.socket, {
                code: MessageCode.SHOW_HINT,
                playerA: match.playerA,
                hint: message.hint,
              });
            }
          }
        }
        break;
    }
  }

  private generatePlayerId(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
}
