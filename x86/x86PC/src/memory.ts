class Memory {
    buffer: ArrayBuffer;
    size: number;

    constructor(size: number) {
        this.size = size;
        this.buffer = new ArrayBuffer(this.size);
    }

    pokeMemory(address: number, data: number, byte_length: number = 4): void {
        switch (byte_length) {
            case 1:
                this.pokeByte(address, data);
                break;

            case 2:
                this.pokeWord(address, data);
                break;

            case 4:
                this.pokeLong(address, data);
                break;

            default:
                throw new Error(
                    "Invalid memory write data size: " + byte_length
                );
        }
    }

    peekMemory(address: number, byte_length: number = 4): number {
        switch (byte_length) {
            case 1:
                return this.peekByte(address);

            case 2:
                return this.peekWord(address);

            case 4:
                return this.peekLong(address);

            default:
                throw new Error(
                    "Invalid memory read data size: " + byte_length
                );
        }
    }

    pokeByte(address: number, data: number): void {
        let arr: Uint8Array = new Uint8Array(this.buffer, address, 1);
        arr[0] = data;
    }

    pokeWord(address: number, data: number): void {
        let arr: Uint16Array = new Uint16Array(this.buffer, address, 1);
        arr[0] = data;
    }

    pokeLong(address: number, data: number): void {
        let arr: Uint32Array = new Uint32Array(this.buffer, address, 1);
        arr[0] = data;
    }

    peekByte(address: number): number {
        let arr: Uint8Array = new Uint8Array(this.buffer, address, 1);
        return arr[0];
    }

    peekWord(address: number): number {
        let arr: Uint16Array = new Uint16Array(this.buffer, address, 1);
        return arr[0];
    }

    peekLong(address: number): number {
        let arr: Uint32Array = new Uint32Array(this.buffer, address, 1);
        return arr[0];
    }

    getSlice(start: number, size: number | undefined) {
        let ret: ArrayBuffer;
        if (size == undefined) {
            ret =  this.buffer.slice(start);
        } else {
            ret = this.buffer.slice(start, start + size);
        }
        return new Uint8Array(ret);
    }
}

export { Memory };
