import { Memory } from "./memory";

class Register {
  register: ArrayBufferView;
  byteLength: number;
  name: string;
  memoryName: string;

  constructor(
    name: string,
    memoryName: string,
    registerMemory: Memory,
    byteLength: number,
    startIndex: number = 0
  ) {
    this.name = name;
    this.byteLength = byteLength;
    this.memoryName = memoryName;
    if (this.byteLength == 1) {
      this.register = new Uint8Array(registerMemory.buffer, startIndex, 1);
    } else if (this.byteLength == 2) {
      this.register = new Uint16Array(registerMemory.buffer, startIndex, 1);
    } else if (this.byteLength == 4) {
      this.register = new Uint32Array(registerMemory.buffer, startIndex, 1);
    } else {
      throw new Error("Invalid register size supplied");
    }
  }

  getNumericValue(): number {
    return this.register[0];
  }

  setNumericvalue(value: number) {
    this.register[0] = value;
  }

  getHexadecimalBytes(): string[] {
    let data: Uint8Array = new Uint8Array(
      this.register.buffer,
      this.register.byteOffset,
      this.register.byteLength
    );

    let retValue: string[] = [];
    for (let byte of data) {
      retValue.push(byte.toString(16));
    }
    return retValue.reverse();
  }
}

export { Register };
