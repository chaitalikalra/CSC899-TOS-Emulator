class EFlags {
    flags: boolean[];
    // From https://en.wikipedia.org/wiki/FLAGS_register
    static byteMappings = {
        CF: 0,
        PF: 2,
        AF: 4,
        ZF: 6,
        SF: 7,
        IF: 9,
        OF: 11
    };

    constructor() {
        this.flags = new Array(32).fill(false);
    }

    public setCarryFlag(val: boolean): void {
        this.flags[EFlags.byteMappings["CF"]] = val;
    }

    public setOverflowFlag(val: boolean): void {
        this.flags[EFlags.byteMappings["OF"]] = val;
    }

    public setZeroFlag(val: boolean): void {
        this.flags[EFlags.byteMappings["ZF"]] = val;
    }

    public setSignFlag(val: boolean): void {
        this.flags[EFlags.byteMappings["SF"]] = val;
    }

    public setParityFlag(val: boolean): void {
        this.flags[EFlags.byteMappings["PF"]] = val;
    }
}

export { EFlags };
