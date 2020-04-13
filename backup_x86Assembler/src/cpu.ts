import { Memory } from "./memory";
import { Register, RegisterStorage } from "./register";
import { EFlags } from "./eflags";
import {
    Operand,
    OperandType,
    NumericConstantOperand,
    RegisterOperand,
    IndirectAddressOperand
} from "./instruction";
import { assert, get_uint } from "./utils";

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
    registers: RegisterMapping;

    constructor(stackSize: number, stackStartIndex: number = 0) {
        this.stackSize = stackSize;
        this.stackMemory = new Memory(this.stackSize);
        this.eFlags = new EFlags();
        this._constructRegisters();
        this._init();
    }

    private _createX86Register(
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

    private _constructRegisters(): void {
        this.registers = {};
        // Create all 8 x86 Registers
        this._createX86Register("eax", true);
        this._createX86Register("ebx", true);
        this._createX86Register("ecx", true);
        this._createX86Register("edx", true);
        this._createX86Register("ebp", false);
        this._createX86Register("esi", false);
        this._createX86Register("edi", false);
        this._createX86Register("esp", false);
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
                    this.stackMemory.peekMemory(
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
                this.stackMemory.pokeMemory(
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

        let ret_value: number = this.stackMemory.peekMemory(
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
        this.stackMemory.pokeMemory(sp_value, data, byte_length);
        this.registers["esp"].setNumericvalue(sp_value);
    }

    public initStackPointer(): void {
        this.registers["esp"].setNumericvalue(this.stackSize);
    }
}

export { CPU };
