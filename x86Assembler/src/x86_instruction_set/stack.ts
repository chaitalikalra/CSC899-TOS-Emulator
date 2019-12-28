import {
    Instruction,
    Operand,
    OperandType,
    InstructionOperandSize
} from "../instruction";
import { assert } from "../utils";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";

class PopInstruction extends Instruction {
    setMnemonic_(): void {
        this.base_mnemonic = "pop";
    }

    validateInstruction_(): void {
        assert(this.operands.length == 1, "pop instructions takes 1 operand");
        let dst: Operand = this.operands[0];
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "pop instruction operand can be only memory or register"
        );
        assert(
            this.operand_size >= 2,
            "pop operand size can only be 16/32 bits"
        );
    }

    genMachineCode_(): void {}

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let dst: Operand = this.operands[0];
        cpu.writeValue(dst, cpu.popStack(this.operand_size), this.operand_size);
    }
}

class PushInstruction extends Instruction {
    setMnemonic_(): void {
        this.base_mnemonic = "push";
    }

    validateInstruction_(): void {
        assert(this.operands.length == 1, "push instructions takes 1 operand");
        assert(
            this.operand_size >= 2,
            "push operand size can only be 16/32 bits"
        );
    }

    genMachineCode_(): void {}

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let src: Operand = this.operands[0];
        cpu.pushStack(cpu.readValue(src, this.operand_size), this.operand_size);
    }
}

export { PopInstruction, PushInstruction };
