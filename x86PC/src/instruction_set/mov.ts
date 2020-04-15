import { x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import { x86Operand } from "../operand";

class MovInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let src: x86Operand = this.operands[0];
        let dst: x86Operand = this.operands[1];
        cpu.writeOperand(
            dst,
            cpu.readOperand(src, this.instructionOpSize),
            this.instructionOpSize
        );
    }
}

export { MovInstruction };
