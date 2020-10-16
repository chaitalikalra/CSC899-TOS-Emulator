import { Register, RegisterStorage } from "./register";
import { EFlags } from "./eflags";
import { Memory } from "./memory";
import { x86Disassembler } from "./disassembler";
import { x86Instruction, InstructionOperandSize } from "./instruction";
import { uint32, get_uint } from "./utils";
import {
    x86Operand,
    x86OperandType,
    x86RegisterOperand,
    x86NumericOperand,
    x86AddressOperand,
} from "./operand";
import { assert } from "./error";

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
        "esp",
    ];

    eFlags: EFlags;
    registers: RegisterMapping;
    eip: Register;
    memory: Memory;

    constructor(memory: Memory) {
        this.memory = memory;
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
        this.eip.setNumericvalue(uint32(value));
    }

    getInstructionPointer(): number {
        return uint32(this.eip.getNumericValue());
    }

    setStackPointer(value: number) {
        this.registers["esp"].setNumericvalue(value);
    }

    executeNextInstruction(disassembler: x86Disassembler): boolean {
        let ipValue: number = this.getInstructionPointer();
        let instruction: x86Instruction | null = disassembler.getNextInstructionFromBytes(
            this.memory.getSlice(
                ipValue,
                x86Instruction.MAX_INSTRUCTION_LENGTH
            ),
            ipValue
        );
        if (instruction == null || instruction.instructionName == "nop") {
            return false;
        }
        this.setInstructionPointer(ipValue + instruction.byteLength);
        console.log(instruction.toString());
        instruction.executeInstruction(this);
        return true;
    }

    writeOperand(
        operand: x86Operand,
        value: number,
        operandSize: InstructionOperandSize = InstructionOperandSize.Long
    ) {
        let val: number = get_uint(value, operandSize);
        switch (operand.type) {
            case x86OperandType.Register:
                this.getRegisterFromOperand(
                    operand as x86RegisterOperand
                ).setNumericvalue(val);
                break;

            case x86OperandType.Address:
                this.memory.pokeMemory(
                    this.getMemoryAddressFromOperand(
                        operand as x86AddressOperand
                    ),
                    val,
                    operandSize
                );
                break;

            default:
                assert(
                    false,
                    `Invalid operand type for write: ${operand.type}`
                );
        }
    }

    readOperand(
        operand: x86Operand,
        operandSize: InstructionOperandSize = InstructionOperandSize.Long
    ): number {
        switch (operand.type) {
            case x86OperandType.Register:
                return get_uint(
                    this.getRegisterFromOperand(
                        operand as x86RegisterOperand
                    ).getNumericValue(),
                    operandSize
                );
                break;
            case x86OperandType.Address:
                return get_uint(
                    this.memory.peekMemory(
                        this.getMemoryAddressFromOperand(
                            operand as x86AddressOperand
                        )
                    ),
                    operandSize
                );
                break;
            case x86OperandType.Numeric:
                return get_uint(
                    (operand as x86NumericOperand).value,
                    operandSize
                );
                break;
            default:
                assert(
                    false,
                    `Invalid operand type for write: ${operand.type}`
                );
        }
    }

    getRegisterFromOperand(operand: x86RegisterOperand): Register {
        return this.registers[operand.name];
    }

    getMemoryAddressFromOperand(operand: x86AddressOperand): number {
        let baseAddress: number = 0;
        if (operand.baseRegister != null) {
            baseAddress = this.registers[
                operand.baseRegister
            ].getNumericValue();
        }

        let indexAddress: number = 0;
        if (operand.indexRegister != null) {
            baseAddress =
                this.registers[operand.indexRegister].getNumericValue() *
                operand.scale;
        }

        return baseAddress + indexAddress + operand.offset;
    }

    pushStack(
        data: number,
        operandSize: InstructionOperandSize = InstructionOperandSize.Long
    ): void {
        let spValue: number = this.registers["esp"].getNumericValue();
        assert(spValue - operandSize >= 0, "Stack overflow!");
        spValue -= operandSize;
        this.memory.pokeMemory(spValue, data, operandSize);
        this.registers["esp"].setNumericvalue(spValue);
    }

    popStack(
        operandSize: InstructionOperandSize = InstructionOperandSize.Long
    ): number {
        let spValue: number = this.registers["esp"].getNumericValue();
        assert(spValue + operandSize <= this.memory.size, "Stack underflow!");

        let retValue: number = this.memory.peekMemory(spValue, operandSize);
        this.registers["esp"].setNumericvalue(spValue + operandSize);
        return retValue;
    }

    getRegisterValues(): object {
        let registers = {
            eip: this.eip.getHexadecimalBytes().join(" "),
        };
        for (const [name, reg] of Object.entries(this.registers)) {
            registers[name] = reg.getHexadecimalBytes().join(" ");
        }
        return registers;
    }

    getFlagValues(): object {
        return this.eFlags.getFlags();
    }
}

export { CPU };
