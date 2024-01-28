import { ErrorCode } from './Error';

export enum MessageCode {
  REQUEST_PASSWORD = 0,
  SEND_PASSWORD = 1,
  INVALID_PASSWORD = 2,
  VALID_PASSWORD = 3,
  REQUEST_OPPONENTS = 4,
  OPPONENTS_LIST = 5,
  REQUEST_MATCH = 6,
  REJECT_MATCH = 7,
  REQUEST_WORD = 8,
  CHECK_WORD = 9,
  INFORM_ATTEMPTS = 10,
  SEND_HINT = 11,
  SHOW_HINT = 12,
  SEND_GIVE_UP = 13,
  SEND_END_MATCH = 14,
  UNKNOWN = 15,
}

export type MessageStrings = {
  password?: string;
  clientId?: string;
  opponents?: string;
  word?: string;
  hint?: string;
};
export type MessageIntegers = {
  code: MessageCode;
  errorCode?: ErrorCode;
  attempts?: number;
};
export type MessageBooleans = {
  status?: boolean;
};
export type Message = MessageStrings & MessageIntegers & MessageBooleans;

export const MessageTemplate = {
  bitmaskBytes: 2, // 9 properties => 9 bits => 2 bytes
  strings: ['password', 'clientId', 'opponents', 'word', 'hint'],
  integers: {
    code: 1, // 16 message codes => 1 bytes
    errorCode: 1, // 3 error codes => 1 byte
    attempts: 1, // 256 max attempts => 1 byte
  },
  booleans: ['status'],
  booleanBytes: 1, // 0 or 1 => 1 byte
};
