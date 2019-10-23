class Memory {
    buffer: ArrayBuffer;
    size: number;

    constructor(size: number) {
        this.size = size;
        this.buffer = new ArrayBuffer(this.size);
    }
}

export { Memory };
