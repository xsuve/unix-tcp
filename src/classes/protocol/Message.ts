import { ErrorCode } from './Error';

export enum MessageCode {
  REQUEST_PASSWORD = 0,
  SEND_PASSWORD = 1,
  INVALID_PASSWORD = 2,
  VALID_PASSWORD = 3,
  REQUEST_OPPONENTS = 4,
  OPPONENTS_LIST = 5,
  NO_OPPONENTS = 6,
  REQUEST_MATCH = 7,
  REJECT_MATCH = 8,
  REQUEST_WORD = 9,
  CHECK_WORD = 10,
  INFORM_ATTEMPT = 11,
  REQUEST_HINT = 12,
  SEND_HINT = 13,
  SHOW_HINT = 14,
  SEND_END_MATCH = 15,
  UNKNOWN = 16,
}

export type MessageStrings = {
  password?: string;
  playerA?: string;
  playerB?: string;
  opponents?: string;
  word?: string;
  hint?: string;
};
export type MessageIntegers = {
  code: MessageCode;
  errorCode?: ErrorCode;
};
export type MessageBooleans = {
  status?: boolean;
};
export type Message = MessageStrings & MessageIntegers & MessageBooleans;

export const MessageTemplate = {
  bitmaskBytes: 2, // 10 properties => 10 bits => 2 bytes
  strings: ['password', 'playerA', 'playerB', 'opponents', 'word', 'hint'],
  integers: {
    code: 1, // 16 message codes => 1 bytes
    errorCode: 1, // 4 error codes => 1 byte
  },
  booleans: ['status'],
  booleanBytes: 1, // 0 or 1 => 1 byte
};
