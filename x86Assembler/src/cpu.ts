import { Memory } from "./memory";
import { Register } from "./register";
import { EFlags } from "./eflags";
import {
    Operand,
    OperandType,
    NumericConstantOperand,
    RegisterOperand,
    IndirectAddressOperand
} from "./instruction";
import { assert, get_uint } from "./utils";

interface MemoryMapping {
    [index: string]: Memory;
}

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

    stackSize: number;
    stackMemory: Memory;
    eFlags: EFlags;
    registerMemory: MemoryMapping;
    registers: RegisterMapping;

    constructor(stackSize: number, stackStartIndex: number = 0) {
        this.stackSize = stackSize;
        this.stackMemory = new Memory(this.stackSize);
        this.eFlags = new EFlags();
        this._constructX86Registers();
        this._init();
    }

    private _constructX86Registers(): void {
        this.registerMemory = {};
        this.registers = {};
        for (let reg of CPU.registerNames) {
            // Allocate memory for registers
            this.registerMemory[reg] = new Memory(4);

            // Create 4 byte registers
            this.registers[reg] = new Register(
                reg,
                reg,
                this.registerMemory[reg],
                4
            );
            // Create 2 byte registers
            let name_2byte = reg.slice(1); // eax -> ax
            this.registers[name_2byte] = new Register(
                name_2byte,
                reg,
                this.registerMemory[reg],
                2
            );
        }
        // Create 1 byte registers
        this.registers["al"] = new Register(
            "al",
            "eax",
            this.registerMemory["eax"],
            1
        );
        this.registers["ah"] = new Register(
            "ah",
            "eax",
            this.registerMemory["eax"],
            1,
            1
        );

        this.registers["bl"] = new Register(
            "bl",
            "ebx",
            this.registerMemory["ebx"],
            1
        );
        this.registers["bh"] = new Register(
            "bl",
            "ebx",
            this.registerMemory["ebx"],
            1,
            1
        );

        this.registers["cl"] = new Register(
            "cl",
            "ecx",
            this.registerMemory["ecx"],
            1
        );
        this.registers["ch"] = new Register(
            "ch",
            "ecx",
            this.registerMemory["ecx"],
            1,
            1
        );

        this.registers["dl"] = new Register(
            "dl",
            "edx",
            this.registerMemory["edx"],
            1
        );
        this.registers["dh"] = new Register(
            "dh",
            "edx",
            this.registerMemory["edx"],
            1,
            1
        );
    }

    private _init(): void {
        this.registers["esp"].setNumericvalue(this.stackSize - 1);
    }

    public getRegister(name: string): Register | undefined {
        return this.registers[name];
    }

    public readValue(operand: Operand, byte_length: number = 4): number {
        switch (operand.type) {
            case OperandType.NumericConstant:
                return get_uint(
                    (operand as NumericConstantOperand).getValue(),
                    byte_length
                );
            case OperandType.Register:
                return get_uint(
                    (operand as RegisterOperand).getValue().getNumericValue(),
                    byte_length
                );
            case OperandType.IndirectAddress:
                return get_uint(
                    this.stackMemory.getMemory(
                        (operand as IndirectAddressOperand).getValue(),
                        byte_length
                    ),
                    byte_length
                );
            default:
                throw new Error(
                    "Invalid operand type for read: " + operand.type
                );
        }
    }

    public writeValue(
        operand: Operand,
        data: number,
        byte_length: number = 4
    ): void {
        let val: number = get_uint(data, byte_length);
        switch (operand.type) {
            case OperandType.Register:
                (operand as RegisterOperand).getValue().setNumericvalue(val);
                break;
            case OperandType.IndirectAddress:
                this.stackMemory.setMemory(
                    (operand as IndirectAddressOperand).getValue(),
                    val,
                    byte_length
                );
                break;
            default:
                throw new Error(
                    "Invalid operand type for write: " + operand.type
                );
        }
    }

    public popStack(byte_length: number = 4): number {
        let sp_value: number = this.registers["esp"].getNumericValue();
        assert(sp_value + byte_length <= this.stackSize, "Stack underflow!");

        let ret_value: number = this.stackMemory.getMemory(
            sp_value,
            byte_length
        );
        this.registers["esp"].setNumericvalue(sp_value + byte_length);
        return ret_value;
    }

    public pushStack(data: number, byte_length: number = 4): void {
        let sp_value: number = this.registers["esp"].getNumericValue();
        assert(sp_value - byte_length >= 0, "Stack overflow!");
        sp_value -= byte_length;
        this.stackMemory.setMemory(sp_value, data, byte_length);
        this.registers["esp"].setNumericvalue(sp_value);
    }

    public initStackPointer(): void {
        this.registers["esp"].setNumericvalue(this.stackSize);
    }
}

export { CPU };
