import { Register, RegisterStorage } from "./register";
import { EFlags } from "./eflags";

interface RegisterMapping {
    [index: string]: Register;
}

class CPU {
    static registerNames: string[] = [
        "eax",
        "ebx",
        "ecx",
        "edx",
        "ebp",
        "esi",
        "edi",
        "esp"
    ];

    eFlags: EFlags;
    registers: RegisterMapping;
    eip: Register;

    constructor() {
        this.eFlags = new EFlags();
        this.constructRegisters_();
        // Create EIP register
        this.eip = new Register("eip", null, 4); 
    }

    private createX86Register_(
        name: string,
        need8BitRegisters: boolean = false
    ): void {
        // Create the Register Storage for the specified register
        let registerStorage = new RegisterStorage(name);

        // We create 4 byte and 2 byte register views for the given register
        // All of these share the same underlying storage
        // So when we update "ax", then "eax" will automatically get updated.
        let register4Bytes: Register = new Register(name, registerStorage, 4);
        // Create 2 byte registers
        let name2Bytes: string = name.slice(1); // eax -> ax
        let register2Bytes: Register = new Register(
            name2Bytes,
            registerStorage,
            2
        );
        this.registers[name] = register4Bytes;
        this.registers[name2Bytes] = register2Bytes;

        // Create 1 byte registers, if needed
        if (need8BitRegisters) {
            let name1ByteLow: string = name.slice(1, 2) + "l"; // eax -> al
            let register1ByteLow: Register = new Register(
                name1ByteLow,
                registerStorage,
                1
            );

            let name1ByteHigh: string = name.slice(1, 2) + "h"; // eax -> ah
            let register1ByteHigh: Register = new Register(
                name1ByteHigh,
                registerStorage,
                1,
                1
            );
            this.registers[name1ByteLow] = register1ByteLow;
            this.registers[name1ByteHigh] = register1ByteHigh;
        }
    }

    private constructRegisters_(): void {
        this.registers = {};
        // Create all 8 x86 Registers
        this.createX86Register_("eax", true);
        this.createX86Register_("ebx", true);
        this.createX86Register_("ecx", true);
        this.createX86Register_("edx", true);
        this.createX86Register_("ebp", false);
        this.createX86Register_("esi", false);
        this.createX86Register_("edi", false);
        this.createX86Register_("esp", false);
    }

    setInstructionPointer(value: number) {
        this.eip.setNumericvalue(value);
    }

    setStackPointer(value: number) {
        this.registers["esp"].setNumericvalue(value);
    }
}

export { CPU };
