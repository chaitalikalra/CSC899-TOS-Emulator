import { Operand, OperandType, RegisterOperand } from "./operand";
import { AssemblyError } from "./error";
import { AssembledProgram } from "./assembler";

enum InstructionOperandSize {
    Byte = 1,
    Word = 2,
    Long = 4,
}

interface InstructionInterface {
    machineCode: Uint8Array;
    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void;
    calculateLength(): number;
    toString(): string;
}

abstract class Instruction implements InstructionInterface {
    operator: string;
    operands: Operand[];
    baseMnemonic: string;
    operandSize: InstructionOperandSize;
    machineCode: Uint8Array;

    constructor(
        operandSize: InstructionOperandSize | null = null,
        operator: string,
        operands: Operand[]
    ) {
        this.operandSize = operandSize;
        this.operator = operator;
        this.operands = operands;

        // Set base mnemonic
        this.setBaseMnemonic_();

        // Validate the instruction operand size
        this.validateAndSetOperandSize_();

        // Validate if the instruction has correct format
        this.validateInstruction_();
    }

    protected abstract setBaseMnemonic_(): void;
    protected abstract validateInstruction_(): void;
    public abstract generateMachineCode(
        assembledProgram: AssembledProgram,
        idx: number
    ): void;
    public abstract calculateLength(): number;

    public toString(): string {
        const MaxMachineCodeSize: number = 30;
        let ret: string = "";
        let machineCodeStr_arr: string[] = [];
        for (let byte of this.machineCode) {
            machineCodeStr_arr.push(byte.toString(16).padStart(2, "0"));
        }
        ret += machineCodeStr_arr.join(" ");
        ret += " ".repeat(MaxMachineCodeSize - ret.length);
        ret += this.operator + "  ";
        let operandsStrArr: string[] = [];
        for (let op of this.operands) operandsStrArr.push(op.toString());
        ret += operandsStrArr.join(",");
        return ret;
    }

    private validateAndSetOperandSize_(): void {
        for (let operand of this.operands) {
            if (operand.type != OperandType.Register) continue;
            if (this.operandSize == null) {
                this.operandSize = (operand as RegisterOperand).getRegisterSize();
            }
            if (
                (operand as RegisterOperand).getRegisterSize() !=
                this.operandSize
            ) {
                throw AssemblyError.throwInvalidOperandSizeError(this.operator);
            }
        }

        // Default operand size when no other information is available
        // is 4 bytes
        if (this.operandSize == null) {
            this.operandSize = InstructionOperandSize.Long;
        }
    }
}

abstract class AssemblerDirective implements InstructionInterface {
    directive: string;
    expressions: (number | string)[];
    machineCode: Uint8Array;

    constructor(directive: string, expressions: (number | string)[]) {
        this.directive = directive;
        this.expressions = expressions;

        this.validateDirective_();
    }

    public toString(): string {
        const MaxMachineCodeSize: number = 30;
        let ret: string = "";
        let machineCodeStr_arr: string[] = [];
        for (let byte of this.machineCode) {
            machineCodeStr_arr.push(byte.toString(16));
        }
        ret += machineCodeStr_arr.join(" ");
        ret += " ".repeat(MaxMachineCodeSize - ret.length);
        ret += this.directive + "  ";
        let operandsStrArr: string[] = [];
        for (let op of this.expressions) operandsStrArr.push(op.toString());
        ret += operandsStrArr.join(",");
        return ret;
    }

    public abstract generateMachineCode(
        assembledProgram: AssembledProgram,
        idx: number
    ): void;

    public abstract calculateLength(): number;

    protected abstract validateDirective_(): void;
}

export {
    Instruction,
    InstructionOperandSize,
    InstructionInterface,
    AssemblerDirective,
};
