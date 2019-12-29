import { Instruction, Operand, OperandType } from "../instruction";
import { assert, get_sign_mask, get_parity } from "../utils";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";

abstract class BinaryLogicalInstruction extends Instruction {
    abstract binaryLogicalFunction(op1: number, op2: number): number;

    validateInstruction_(): void {
        assert(
            this.operands.length == 2,
            this.operator + " instruction take 2 operands"
        );

        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "Destination can only be a register or memory address for " +
                this.operator +
                " instruction."
        );
        assert(
            !(
                src.type == OperandType.IndirectAddress &&
                dst.type == OperandType.IndirectAddress
            ),
            this.operator +
                " operator does not support memory to memory operations"
        );
    }

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];

        let result: number = this.binaryLogicalFunction(
            cpu.readValue(src, this.operand_size),
            cpu.readValue(dst, this.operand_size)
        );
        this.setFlags_(result, cpu);
        cpu.writeValue(dst, result, this.operand_size);
    }

    private setFlags_(result: number, cpu: CPU): void {
        // https://x86.puri.sm/html/file_module_x86_id_12.html
        // Logical instructions do the following:

        // 1. The OF and CF flags are cleared;
        cpu.eFlags.set_overflow_flag(false);
        cpu.eFlags.set_carry_flag(false);

        // 2. The SF, ZF, and PF flags are set according to the result
        cpu.eFlags.set_zero_flag(result == 0);
        cpu.eFlags.set_sign_flag(
            Boolean(result & get_sign_mask(this.operand_size))
        );
        cpu.eFlags.set_parity_flag(get_parity(result));
    }
}

class AndInstruction extends BinaryLogicalInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "and";
    }

    genMachineCode_(): void {}

    binaryLogicalFunction(op1: number, op2: number): number {
        return (op1 & op2) >>> 0;
    }
}

class OrInstruction extends BinaryLogicalInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "or";
    }

    genMachineCode_(): void {}

    binaryLogicalFunction(op1: number, op2: number): number {
        return (op1 | op2) >>> 0;
    }
}

class XorInstruction extends BinaryLogicalInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "xor";
    }

    genMachineCode_(): void {}

    binaryLogicalFunction(op1: number, op2: number): number {
        return (op1 ^ op2) >>> 0;
    }
}

export { XorInstruction, AndInstruction, OrInstruction };
