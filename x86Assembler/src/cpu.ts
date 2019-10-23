import { Memory } from "./memory";
import { Register } from "./register";
import { EFlags } from "./eflags";

interface MemoryMapping {
    [index: string]: Memory;
}

interface RegisterMapping {
    [index: string]: Register;
}

class CPU {
    static registerNames: string[] = [
        "eax", "ebx", "ecx", "edx",
        "ebp", "esi", "edi", "esp"
    ];

    stackSize: number
    stackStartIndex: number
    stackMemory: Memory;
    eFlags: EFlags;
    registerMemory: MemoryMapping;
    registers: RegisterMapping;

    constructor(stackSize: number, stackStartIndex: number = 0) {
        this.stackSize = stackSize;
        this.stackStartIndex = stackStartIndex;
        this.stackMemory = new Memory(this.stackSize);
        this.eFlags = new EFlags();
        this._constructX86Registers();
    }

    private _constructX86Registers() {
        this.registerMemory = {};
        this.registers = {};
        for (let reg of CPU.registerNames) {
            // Allocate memory for registers
            this.registerMemory[reg] = new Memory(4);

            // Create 4 byte registers
            this.registers[reg] = new Register(reg, reg,
                this.registerMemory[reg], 4);
            // Create 2 byte registers
            let name_2byte = reg.slice(1); // eax -> ax
            this.registers[name_2byte] = new Register(name_2byte, reg,
                this.registerMemory[reg], 2);
        }
        // Create 1 byte registers
        this.registers["al"] = new Register("al", "eax",
            this.registerMemory["eax"], 1);
        this.registers["ah"] = new Register("ah", "eax",
            this.registerMemory["eax"], 1, 1);

        this.registers["bl"] = new Register("bl", "ebx",
            this.registerMemory["ebx"], 1);
        this.registers["bh"] = new Register("bl", "ebx",
            this.registerMemory["ebx"], 1, 1);

        this.registers["cl"] = new Register("cl", "ecx",
            this.registerMemory["ecx"], 1);
        this.registers["ch"] = new Register("ch", "ecx",
            this.registerMemory["ecx"], 1, 1);

        this.registers["dl"] = new Register("dl", "edx",
            this.registerMemory["edx"], 1);
        this.registers["dh"] = new Register("dh", "edx",
            this.registerMemory["edx"], 1, 1);

    }

    public getRegister(name: string) : Register | undefined {
        return this.registers[name];
    }
}

export { CPU };
