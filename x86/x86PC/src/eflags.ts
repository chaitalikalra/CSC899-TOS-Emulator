class EFlags {
    flags: boolean[];
    // From https://en.wikipedia.org/wiki/FLAGS_register
    static byteMappings = {
        CF: 0,
        PF: 2,
        AF: 4,
        ZF: 6,
        SF: 7,
        TF: 8,
        IF: 9,
        DF: 10,
        OF: 11,
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

    public getCarryFlag(): boolean {
        return this.flags[EFlags.byteMappings["CF"]];
    }

    public getOverflowFlag(): boolean {
        return this.flags[EFlags.byteMappings["OF"]];
    }

    public getZeroFlag(): boolean {
        return this.flags[EFlags.byteMappings["ZF"]];
    }

    public getSignFlag(): boolean {
        return this.flags[EFlags.byteMappings["SF"]];
    }

    public getParityFlag(): boolean {
        return this.flags[EFlags.byteMappings["PF"]];
    }

    public getFlags(): object {
        return {
            carry: this.getCarryFlag().toString(),
            zero: this.getZeroFlag().toString(),
            parity: this.getParityFlag().toString(),
            overflow: this.getOverflowFlag().toString(),
            sign: this.getSignFlag().toString(),
        };
    }

    public getFlagsNumericValue(lowerWord: boolean = false): number {
        let arrToReduce: number[];
        if (lowerWord) arrToReduce = this.flags.slice(0, 16).map(Number);
        else arrToReduce = this.flags.map(Number);
        // convert bit array to number
        return arrToReduce.reduce((res, x) => (res << 1) | x);
    }

    public writeNumericToFlags(
        value: number,
        lowerWord: boolean = false
    ): void {
        let boolArray: boolean[] = value
            .toString(2)
            .padStart(32, "0")
            .split("")
            .reverse()
            .map((x) => (x == "1" ? true : false));
        if (lowerWord) {
            this.flags = [
                ...boolArray.slice(0, 16),
                ...this.flags.slice(16, 32),
            ];
        } else {
            this.flags = boolArray.slice(0, 32);
        }
    }
}

export { EFlags };
