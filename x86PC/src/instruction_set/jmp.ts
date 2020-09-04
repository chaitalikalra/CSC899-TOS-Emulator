import { x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import { x86Operand, x86OperandType, x86AddressOperand } from "../operand";
import { assert } from "../error";

class JmpInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        // If jump condition is not satisfied, do nothing
        if (!this.jmpCondition_(cpu)) return;

        let dst: x86Operand = this.operands[0];
        assert(
            dst.type == x86OperandType.Address,
            "Destination for jmp operator can only be an address"
        );

        let jmpAddress: number = cpu.getMemoryAddressFromOperand(
            dst as x86AddressOperand
        );
        cpu.setInstructionPointer(jmpAddress);
    }

    protected jmpCondition_(cpu: CPU): boolean {
        return true;
    }
}

class JnzInstruction extends JmpInstruction {
    protected jmpCondition_(cpu: CPU): boolean {
        return cpu.eFlags.getZeroFlag() != true;
    }
}

export { JmpInstruction, JnzInstruction };
