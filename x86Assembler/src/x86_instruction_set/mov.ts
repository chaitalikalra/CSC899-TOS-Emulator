import { Instruction, Operand, OperandType } from "../instruction";
import { assert } from "../utils";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";

class MovInstruction extends Instruction {
    setMnemonic_(): void {
        this.base_mnemonic = "mov";
    }

    validateInstruction_(): void {
        assert(this.operands.length == 2, "mov instructions take 2 operands");
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "mov destination can only be a register or memory address"
        );
        assert(
            !(
                src.type == OperandType.IndirectAddress &&
                dst.type == OperandType.IndirectAddress
            ),
            "mov does not support memory to memory transfer"
        );
    }

    genMachineCode_(): void {}

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        cpu.writeValue(
            dst,
            cpu.readValue(src, this.operand_size),
            this.operand_size
        );
    }
}

class LeaInstruction extends Instruction {
    setMnemonic_(): void {
        this.base_mnemonic = "lea";
    }

    validateInstruction_(): void {
        assert(this.operands.length == 2, "lea instructions take 2 operands");
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        assert(
            dst.type == OperandType.Register,
            "lea dst can only be a register"
        );
        assert(
            src.type == OperandType.IndirectAddress ||
                src.type == OperandType.NumericConstant,
            "lea src can only be a memory address or a constant"
        );
        assert(
            this.operand_size >= 2,
            "lea operands size can only be 16/32 bits"
        );
    }

    genMachineCode_(): void {}

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        cpu.writeValue(dst, src.getValue(), this.operand_size);
    }
}

export { MovInstruction, LeaInstruction };
