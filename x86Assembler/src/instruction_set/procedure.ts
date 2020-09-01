import { Instruction } from "../instruction";
import { assert } from "../error";
import {
    Operand,
    OperandType,
    RegisterOperand,
    NumericConstantOperand,
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

export { RetInstruction };
