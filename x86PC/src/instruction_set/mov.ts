import { x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import { x86Operand, x86AddressOperand } from "../operand";

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

class LeaInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let src: x86Operand = this.operands[0];
        let dst: x86Operand = this.operands[1];
        cpu.writeOperand(
            dst,
            cpu.getMemoryAddressFromOperand(src as x86AddressOperand),
            this.instructionOpSize
        );
    }
}

export { MovInstruction, LeaInstruction };
