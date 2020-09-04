import { x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import { x86Operand, x86OperandType, x86AddressOperand } from "../operand";
import { assert } from "../error";

class CallInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let dst: x86Operand = this.operands[0];
        assert(
            dst.type == x86OperandType.Address,
            "Destination for call operator can only be an address"
        );

        // Write the value of current eip to stack
        cpu.pushStack(cpu.getInstructionPointer());

        let callAddress: number = cpu.getMemoryAddressFromOperand(
            dst as x86AddressOperand
        );
        cpu.setInstructionPointer(callAddress);
    }
}

class RetInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        // Pop return address from stack and write to eip
        cpu.setInstructionPointer(cpu.popStack());
    }
}

export { CallInstruction, RetInstruction };
