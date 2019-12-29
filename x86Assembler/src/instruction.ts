import { CPU } from "./cpu";
import { Register } from "./register";
import { assert } from "./utils";
import { AssembledCode } from "./assembled_code";

interface Operand {
    type: OperandType;
    getValue(): any;
    toString(): string;
}

enum OperandType {
    NumericConstant = "numericConstant",
    IndirectAddress = "indirectAddres",
    Register = "register",
    LabelAddress = "labelAddress"
}

class RegisterOperand implements Operand {
    type: OperandType;
    name: string;
    register: Register;
    constructor(name: string, register: Register) {
        this.type = OperandType.Register;
        this.name = name;
        this.register = register;
    }

    getValue(): Register {
        return this.register;
    }

    toString(): string {
        return "%" + this.name;
    }
}

class IndirectAddressOperand implements Operand {
    type: OperandType;
    offset: number;
    baseRegister: Register | null;
    scale: number;
    indexRegister: Register | null;

    constructor(
        baseRegister: Register | null,
        offset: number,
        indexRegister: Register | null,
        scale: number
    ) {
        this.type = OperandType.IndirectAddress;
        this.baseRegister = baseRegister;
        this.indexRegister = indexRegister;
        this.offset = offset;
        this.scale = scale;
    }

    getValue(): number {
        if (this.baseRegister == null && this.indexRegister == null) {
            throw new Error("Both Base and Index Register cannot be null");
        }
        if (this.scale <= 0) {
            throw new Error("Indirect address scale must be greater than 0");
        }

        let baseAddress: number = 0;
        if (this.baseRegister != null) {
            baseAddress = this.baseRegister.getNumericValue();
        }

        let indexAddress: number = 0;
        if (this.indexRegister != null) {
            indexAddress = this.indexRegister.getNumericValue() * this.scale;
        }

        return baseAddress + indexAddress + this.offset;
    }

    toString(): string {
        let content: string = "";
        if (this.baseRegister != null) content += "%" + this.baseRegister.name;
        if (this.indexRegister != null) {
            content += ",";
            content += "%" + this.indexRegister.name;
        }
        if (this.scale != 1) {
            content += ",";
            content += this.scale.toString();
        }
        if (this.offset != 0) {
            return this.offset.toString() + "(" + content + ")";
        } else {
            return "(" + content + ")";
        }
    }
}

class NumericConstantOperand implements Operand {
    type: OperandType;
    value: number;
    constructor(value: number) {
        this.type = OperandType.NumericConstant;
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    toString(): string {
        return "$0x" + this.value.toString(16);
    }
}

class LabelAddressOperand implements Operand {
    type: OperandType;
    name: string;
    constructor(name: string) {
        this.type = OperandType.LabelAddress;
        this.name = name;
    }

    getValue(): string {
        return this.name;
    }

    toString(): string {
        return this.name;
    }
}

enum InstructionOperandSize {
    Byte = 1,
    Word = 2,
    Long = 4
}

abstract class Instruction {
    operator: string;
    operands: Operand[];
    base_mnemonic: string;
    operand_size: InstructionOperandSize;
    machine_code: Uint8Array;

    constructor(
        operand_size: InstructionOperandSize | null = null,
        operator: string,
        operands: Operand[]
    ) {
        this.operator = operator;
        this.operands = operands;
        this.base_mnemonic = "";
        // Set or infer operand size
        this.validateAndSetOperandSize_(operand_size);
    }

    abstract genMachineCode_(): void;

    abstract validateInstruction_(): void;

    abstract setMnemonic_(): void;

    abstract executeInstruction(cpu: CPU, assembled_code: AssembledCode): void;

    public assembleInstruction(): void {
        // Validate Instruction First
        this.validateInstruction_();
        // Set base mnemonic
        this.setMnemonic_();
        // Now generate machine code
        this.genMachineCode_();
    }

    private validateAndSetOperandSize_(
        operand_size: InstructionOperandSize | null = null
    ): void {
        for (let operand of this.operands) {
            if (operand.type != OperandType.Register) continue;

            if (operand_size == null)
                operand_size = (operand as RegisterOperand).register.byteLength;

            assert(
                (operand as RegisterOperand).register.byteLength ==
                    operand_size,
                "Invalid operand size for instruction " + this.base_mnemonic
            );
        }
        if (operand_size != null) {
            this.operand_size = operand_size;
        } else {
            this.operand_size = InstructionOperandSize.Long;
        }
    }

    static getRegister(name: string, cpu: CPU): Register {
        let reg: Register | undefined = cpu.getRegister(name);
        if (reg == undefined) {
            throw new Error("Invalid Register: " + name);
        }
        return reg;
    }

    public toString(): string {
        const max_machine_code_size: number = 30
        let ret: string = "";
        let machine_code_str_arr: string[] = [];
        for (let byte of this.machine_code) {
            machine_code_str_arr.push(byte.toString(16));
        }
        ret += machine_code_str_arr.join(" ");
        ret += " ".repeat(max_machine_code_size - ret.length);
        ret += this.operator + "  ";
        let operands_str_arr: string[] = [];
        for (let op of this.operands) operands_str_arr.push(op.toString());
        ret += operands_str_arr.join(",");
        return ret;
    }
}

export {
    Instruction,
    InstructionOperandSize,
    Operand,
    OperandType,
    RegisterOperand,
    IndirectAddressOperand,
    NumericConstantOperand,
    LabelAddressOperand
};
