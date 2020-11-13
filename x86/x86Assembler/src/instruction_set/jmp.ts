import { Instruction } from "../instruction";
import { AssemblyError, assert } from "../error";
import {
    Operand,
    OperandType,
    LabelAddressOperand,
} from "../operand";
import { AssembledProgram } from "../assembler";
import {
    combineMachineCode,
    getImmediateBytes,
} from "../assembler_utils";

class JmpInstruction extends Instruction {
    readonly Opcode: number[] = [0xe9];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "jmp";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 1, "jmp instructions takes 1 operand");
        let dst: Operand = this.operands[0];
        assert(
            dst.type == OperandType.LabelAddress,
            "jmp instruction operand can be only Label Address"
        );
    }

    calculateLength(): number {
        // Hardcoding only long jumps
        return 5;
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_147.html
        let dst: Operand = this.operands[0];
        let opcode: number[] = this.Opcode;
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
        
        // Offset is in 2's compliment form
        let immediate: number[] = getImmediateBytes(offset, 4);

        this.machineCode = combineMachineCode(
            (opcode = opcode),
            (immediate = immediate)
        );
    }
}

class JmpNZInstruction extends JmpInstruction {
    readonly Opcode: number[] = [0x0f, 0x85];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "jnz";
    }

    calculateLength(): number {
        // Hardcoding only long jumps
        return 6;
    }
}

export { JmpInstruction, JmpNZInstruction };
