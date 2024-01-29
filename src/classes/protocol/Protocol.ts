// https://www.dynetisgames.com/2017/06/14/custom-binary-protocol-javascript/

import {
  Message,
  MessageBooleans,
  MessageCode,
  MessageIntegers,
  MessageStrings,
  MessageTemplate,
} from './Message';

export class Protocol {
  private messageTemplate: typeof MessageTemplate;

  constructor() {
    this.messageTemplate = MessageTemplate;
  }

  encode(message: Message): Uint8Array {
    const messageSize = this.getMessageSize(message);
    const buffer = new ArrayBuffer(messageSize);
    this.encodeBuffer(message, buffer);

    const uInt8Array = new Uint8Array(buffer);

    return uInt8Array;
  }

  decode(buffer: Buffer): Message {
    const arrayBuffer = this.bufferToArrayBuffer(buffer);
    const dataView = new DataView(arrayBuffer);

    let offset = 0;

    let message: Message = { code: MessageCode.UNKNOWN };

    const templatePropsCount = this.countTemplateProps();

    const method = 'getUint' + this.messageTemplate.bitmaskBytes * 8;
    let bitmask = (dataView as any)[method as keyof DataView](offset);
    offset += this.messageTemplate.bitmaskBytes;

    let idx = 1;

    // Strings
    if (this.messageTemplate.strings) {
      this.messageTemplate.strings.forEach((key) => {
        if (this.isMaskTrue(bitmask, templatePropsCount, idx)) {
          const length = dataView.getUint8(offset);
          offset++;
          message[key as keyof MessageStrings] = this.decodeString(
            dataView,
            length,
            offset
          );
          offset += length;
        }

        idx++;
      });
    }

    // Integers
    if (this.messageTemplate.integers) {
      Object.keys(this.messageTemplate.integers).forEach((key) => {
        if (this.isMaskTrue(bitmask, templatePropsCount, idx)) {
          const bytes =
            this.messageTemplate.integers[key as keyof MessageIntegers];
          const method = 'getUint' + bytes * 8;
          (message as any)[key as keyof MessageIntegers] = (dataView as any)[
            method as keyof DataView
          ](offset);
          offset += bytes;
        }

        idx++;
      });
    }

    // Booleans
    if (this.messageTemplate.booleans) {
      const method = 'getUint' + this.messageTemplate.booleanBytes * 8;
      const booleans = (dataView as any)[method as keyof DataView](offset);
      let boolIdx = 1;
      offset += this.messageTemplate.booleanBytes;
      this.messageTemplate.booleans.forEach((key) => {
        if (this.isMaskTrue(bitmask, templatePropsCount, idx)) {
          message[key as keyof MessageBooleans] = Boolean(
            this.isMaskTrue(
              booleans,
              this.messageTemplate.booleans.length,
              boolIdx
            )
          );
        }

        idx++;
        boolIdx++;
      });
    }

    return message;
  }

  private getMessageSize(message: Message): number {
    let size = 0;

    // Bitmask
    size += this.messageTemplate.bitmaskBytes;

    // Strings
    this.messageTemplate.strings.forEach((key) => {
      if (message[key as keyof MessageStrings] !== undefined) {
        size += message[key as keyof MessageStrings]!.length + 1;
      }
    });

    // Integers
    Object.keys(this.messageTemplate.integers).forEach((key) => {
      if (message[key as keyof MessageIntegers] !== undefined) {
        size += this.messageTemplate.integers[key as keyof MessageIntegers];
      }
    });

    // Booleans
    size += this.messageTemplate.booleanBytes;

    return size;
  }

  private encodeBuffer(message: Message, buffer: ArrayBuffer): void {
    const dataView = new DataView(buffer);

    let offset = 0;

    let bitmaskOffset = offset;

    offset = this.encodeBytes(
      dataView,
      bitmaskOffset,
      this.messageTemplate.bitmaskBytes,
      0
    );

    let bitmask = 0;

    // Strings
    if (this.messageTemplate.strings) {
      this.messageTemplate.strings.forEach((key) => {
        if (message[key as keyof MessageStrings] !== undefined) {
          const length = message[key as keyof MessageStrings]!.length;
          offset = this.encodeBytes(dataView, offset, 1, length);
          this.encodeString(
            dataView,
            offset,
            message[key as keyof MessageStrings]!
          );
          offset += length;
          bitmask |= 1;
        }

        bitmask <<= 1;
      });
    }

    // Integers
    if (this.messageTemplate.integers) {
      Object.keys(this.messageTemplate.integers).forEach((key) => {
        if (message[key as keyof MessageIntegers] !== undefined) {
          offset = this.encodeBytes(
            dataView,
            offset,
            this.messageTemplate.integers[key as keyof MessageIntegers],
            message[key as keyof MessageIntegers]!
          );
          bitmask |= 1;
        }

        bitmask <<= 1;
      });
    }

    // Booleans
    if (this.messageTemplate.booleans) {
      let booleans = 0;

      this.messageTemplate.booleans.forEach((key) => {
        if (message[key as keyof MessageBooleans] !== undefined) {
          bitmask |= 1;
          booleans |= Number(message[key as keyof MessageBooleans]);
        }

        bitmask <<= 1;
        // booleans <<= 1;
      });

      bitmask >>= 1;
      offset = this.encodeBytes(
        dataView,
        offset,
        this.messageTemplate.booleanBytes,
        booleans
      );
    }

    // bitmask >>= 1;
    const method = 'setUint' + this.messageTemplate.bitmaskBytes * 8;
    (dataView as any)[method as keyof DataView](bitmaskOffset, bitmask);
  }

  private encodeBytes(
    dataView: DataView,
    offset: number,
    bytes: number,
    value: number
  ): number {
    const method = 'setUint' + bytes * 8;
    (dataView as any)[method as keyof DataView](offset, value);
    offset += bytes;

    return offset;
  }

  private encodeString(dataView: DataView, offset: number, str: string): void {
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      dataView.setUint8(offset, str.charCodeAt(i));
      offset++;
    }
  }

  private countTemplateProps(): number {
    let count = 0;

    if (this.messageTemplate.strings !== undefined) {
      count += this.messageTemplate.strings.length;
    }

    if (this.messageTemplate.integers !== undefined) {
      count += Object.keys(this.messageTemplate.integers).length;
    }

    if (this.messageTemplate.booleans !== undefined) {
      count += this.messageTemplate.booleans.length;
    }

    return count;
  }

  private isMaskTrue(
    mask: number,
    templatePropsCount: number,
    idx: number
  ): number {
    return (mask >> (templatePropsCount - idx)) & 1;
  }

  private decodeString(dataView: DataView, length: number, offset: number) {
    const chars = [];

    for (let i = 0; i < length; i++) {
      chars.push(String.fromCharCode(dataView.getUint8(offset)));
      offset++;
    }

    return chars.join('');
  }

  private bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const dataView = new DataView(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      dataView.setUint8(i, buffer[i]);
    }

    return arrayBuffer;
  }
}
