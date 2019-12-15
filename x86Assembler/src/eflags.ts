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

    public set_carry_flag(val: boolean): void {
        this.flags[EFlags.byteMappings["CF"]] = val;
    }

    public set_overflow_flag(val: boolean): void {
        this.flags[EFlags.byteMappings["OF"]] = val;
    }

    public set_zero_flag(val: boolean): void {
        this.flags[EFlags.byteMappings["ZF"]] = val;
    }

    public set_sign_flag(val: boolean): void {
        this.flags[EFlags.byteMappings["SF"]] = val;
    }

    public set_parity_flag(val: boolean): void {
        this.flags[EFlags.byteMappings["PF"]] = val;
    }
}

export { EFlags };
