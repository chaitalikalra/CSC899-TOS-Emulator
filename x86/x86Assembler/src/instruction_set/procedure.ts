import { Instruction } from "../instruction";
import { assert, AssemblyError } from "../error";
import {
    Operand,
    OperandType,
    RegisterOperand,
    NumericConstantOperand,
    LabelAddressOperand,
} from "../operand";
import { AssembledProgram } from "../assembler";
import {
    OPERAND_SIZE_OVERRIDE,
    REGISTER_CODES,
    fillModRmSibDisp,
    combineMachineCode,
    getImmediateBytes,
    getModRmSibDispLength,
} from "../assembler_utils";

class RetInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "ret";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 0, "ret instructions takes no operand");
    }

    calculateLength(): number {
        return 1; // only opcode takes 1 byte
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        let opcode: number[] = [0xc3];
        this.machineCode = combineMachineCode((opcode = opcode));
    }
}

class CallInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "call";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 1, "call instructions takes 1 operand");
        let dst: Operand = this.operands[0];
        assert(
            dst.type == OperandType.LabelAddress,
            "call instruction operand can be only Label Address"
        );
    }

    calculateLength(): number {
        // Hardcoding for 4 byte address
        return 5;
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_147.html
        let dst: Operand = this.operands[0];
        let opcode: number[] = [0xe8];
        let labelName: string = (dst as LabelAddressOperand).name;
        if (!(labelName in assembledProgram.symbolTable)) {
            throw AssemblyError.throwInvalidLabelError(labelName);
        }
        let labelAddress =
            assembledProgram.instructionStartAddr[
                assembledProgram.symbolTable[labelName]
            ];
        let offset: number =
            labelAddress -
            (assembledProgram.instructionStartAddr[idx] +
                assembledProgram.instructionLengths[idx]);

        // Offset is in 2's compliment
        let immediate: number[] = getImmediateBytes(offset, 4);

        this.machineCode = combineMachineCode(
            (opcode = opcode),
            (immediate = immediate)
        );
    }
}

export { RetInstruction, CallInstruction };
