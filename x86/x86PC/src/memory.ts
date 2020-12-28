import { RuntimeError } from "./error";

class Memory {
    buffer: ArrayBuffer;
    size: number;

    constructor(size: number) {
        this.size = size;
        this.buffer = new ArrayBuffer(this.size);
    }

    private validateMemoryAccess_(address: number, byte_length: number): void {
        if (address + byte_length > this.size) {
            throw RuntimeError.throwIllegalMemoryAccessError(
                address,
                byte_length
            );
        }
    }

    private copyBytes_(
        sourceBuf: ArrayBuffer,
        targetBuf: ArrayBuffer,
        sourceStart: number,
        targetStart: number,
        numBytes: number
    ): void {
        let sourceArr = new Uint8Array(sourceBuf, sourceStart, numBytes);
        let targetArr = new Uint8Array(targetBuf, targetStart, numBytes);
        for (let i: number = 0; i < numBytes; i++) {
            targetArr[i] = sourceArr[i];
        }
    }

    pokeMemory(address: number, data: number, byte_length: number = 4): void {
        this.validateMemoryAccess_(address, byte_length);
        switch (byte_length) {
            case 1:
                this.pokeByte_(address, data);
                break;

            case 2:
                this.pokeWord_(address, data);
                break;

            case 4:
                this.pokeLong_(address, data);
                break;

            default:
                throw new Error(
                    "Invalid memory write data size: " + byte_length
                );
        }
    }

    peekMemory(address: number, byte_length: number = 4): number {
        this.validateMemoryAccess_(address, byte_length);
        switch (byte_length) {
            case 1:
                return this.peekByte_(address);

            case 2:
                return this.peekWord_(address);

            case 4:
                return this.peekLong_(address);

            default:
                throw new Error(
                    "Invalid memory read data size: " + byte_length
                );
        }
    }

    private pokeByte_(address: number, data: number): void {
        let arr: Uint8Array = new Uint8Array(this.buffer, address, 1);
        arr[0] = data;
    }

    private pokeWord_(address: number, data: number): void {
        let buf = new ArrayBuffer(2);
        let arr: Uint16Array = new Uint16Array(buf, 0, 1);
        arr[0] = data;
        this.copyBytes_(buf, this.buffer, 0, address, 2);
    }

    private pokeLong_(address: number, data: number): void {
        let buf = new ArrayBuffer(4);
        let arr: Uint32Array = new Uint32Array(buf, 0, 1);
        arr[0] = data;
        this.copyBytes_(buf, this.buffer, 0, address, 4);
    }

    private peekByte_(address: number): number {
        let arr: Uint8Array = new Uint8Array(this.buffer, address, 1);
        return arr[0];
    }

    private peekWord_(address: number): number {
        let buf = new ArrayBuffer(2);
        this.copyBytes_(this.buffer, buf, address, 0, 2);
        let arr: Uint16Array = new Uint16Array(buf, 0, 1);
        return arr[0];
    }

    private peekLong_(address: number): number {
        let buf = new ArrayBuffer(4);
        this.copyBytes_(this.buffer, buf, address, 0, 4);
        let arr: Uint32Array = new Uint32Array(buf, 0, 1);
        return arr[0];
    }

    getSlice(start: number, size: number | undefined) {
        let ret: ArrayBuffer;
        if (size == undefined) {
            ret = this.buffer.slice(start);
        } else {
            ret = this.buffer.slice(start, start + size);
        }
        return new Uint8Array(ret);
    }

    getHexadecimalBytes(): string[] {
        let retValue: string[] = [];
        let data = new Uint8Array(this.buffer);
        for (let byte of data) {
            retValue.push(byte.toString(16).padStart(2, "0"));
        }
        return retValue;
    }
}

export { Memory };
