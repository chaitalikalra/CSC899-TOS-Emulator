import { AssembledProgram } from "../assembler";
import { combineMachineCode } from "../assembler_utils";
import { assert } from "../error";
import { Instruction } from "../instruction";

class NopInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "nop";
    }

    protected validateInstruction_(): void {
        assert(
            this.operands.length == 0,
            "nop instruction does not take any argument"
        );
    }

    calculateLength(): number {
        return 1; // only opcode takes 1 byte
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        let opcode: number[] = [0x90];
        this.machineCode = combineMachineCode((opcode = opcode));
    }
}

export { NopInstruction };
