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
                return this.getByte(address);

            case 2:
                return this.getWord(address);

            case 4:
                return this.getLong(address);

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

    getByte(address: number): number {
        let arr: Uint8Array = new Uint8Array(this.buffer, address, 1);
        return arr[0];
    }

    getWord(address: number): number {
        let arr: Uint16Array = new Uint16Array(this.buffer, address, 1);
        return arr[0];
    }

    getLong(address: number): number {
        let arr: Uint32Array = new Uint32Array(this.buffer, address, 1);
        return arr[0];
    }

    getHexadecimalBytesJson(): string[] {
        let data: Uint8Array = new Uint8Array(this.buffer);
        let retValue: string[] = [];
        for (let byte of data) {
            retValue.push(byte.toString(16));
        }
        return retValue;
    }

    getHexadecimalWordsJson(): string[] {
        let data: Uint16Array = new Uint16Array(this.buffer);
        let retValue: string[] = [];
        for (let byte of data) {
            retValue.push(byte.toString(16));
        }
        return retValue;
    }

    getHexadecimalLongsJson(): string[] {
        let data: Uint32Array = new Uint32Array(this.buffer);
        let retValue: string[] = [];
        for (let byte of data) {
            retValue.push(byte.toString(16));
        }
        return retValue;
    }
}

export { Memory };
