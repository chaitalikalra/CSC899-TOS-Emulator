import { x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import { x86Operand } from "../operand";

class PushInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let src: x86Operand = this.operands[0];
        cpu.pushStack(
            cpu.readOperand(src, this.instructionOpSize),
            this.instructionOpSize
        );
    }
}

class PopInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let dst: x86Operand = this.operands[0];
        cpu.writeOperand(
            dst,
            cpu.popStack(this.instructionOpSize),
            this.instructionOpSize
        );
    }
}

export { PushInstruction, PopInstruction };
