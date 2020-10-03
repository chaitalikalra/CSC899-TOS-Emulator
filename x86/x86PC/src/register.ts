class RegisterStorage {
    // x86 Register Size
    static registerSize: number = 4;
    // Actual space to store the 4 byte registers
    registerStore: ArrayBuffer;
    name: string;

    constructor(name: string, size: number = RegisterStorage.registerSize) {
        this.name = name;
        this.registerStore = new ArrayBuffer(size);
    }
}

class Register {
    register: ArrayBufferView;
    byteLength: number;
    name: string;
    storage: RegisterStorage;

    constructor(
        name: string,
        storage: RegisterStorage | null,
        byteLength: number,
        startIndex: number = 0
    ) {
        this.name = name;
        this.byteLength = byteLength;
        if (storage == null) {
            storage = new RegisterStorage(name, byteLength);
        }

        this.storage = storage;
        if (this.byteLength == 1) {
            this.register = new Uint8Array(
                storage.registerStore,
                startIndex,
                1
            );
        } else if (this.byteLength == 2) {
            this.register = new Uint16Array(
                storage.registerStore,
                startIndex,
                1
            );
        } else if (this.byteLength == 4) {
            this.register = new Uint32Array(
                storage.registerStore,
                startIndex,
                1
            );
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

export { Register, RegisterStorage };
