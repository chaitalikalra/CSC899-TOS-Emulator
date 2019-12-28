import { Instruction, Operand, OperandType } from "../instruction";
import { assert, get_sign_mask, get_parity, get_uint } from "../utils";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";

abstract class ArithmeticInstruction extends Instruction {
    protected setSomeFlags_(result: number, cpu: CPU): void {
        // https://x86.puri.sm/html/file_module_x86_id_5.html
        // Arithmetic instructions do the following:
        // The OF, SF, ZF, CF, and PF flags are set according to the result.

        // Set only SF, ZF and PF. OF and CF are set in individual functions
        let uint_result: number = get_uint(result, this.operand_size);
        cpu.eFlags.set_zero_flag(uint_result == 0);
        cpu.eFlags.set_sign_flag(
            Boolean(uint_result & get_sign_mask(this.operand_size))
        );
        cpu.eFlags.set_parity_flag(get_parity(uint_result));
    }
}

abstract class UnaryArithmeticInstruction extends ArithmeticInstruction {
    validateInstruction_(): void {
        assert(
            this.operands.length == 1,
            this.operator + " instruction takes only 1 operand"
        );
        let dst: Operand = this.operands[0];
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "Operand to " + this.operator + " can only be register or memory."
        );
    }
}

abstract class BinaryArithmeticInstruction extends ArithmeticInstruction {
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
}

class AddInstruction extends BinaryArithmeticInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "add";
    }

    genMachineCode_(): void {}

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        let op1: number = cpu.readValue(src, this.operand_size);
        let op2: number = cpu.readValue(dst, this.operand_size);
        let result: number = op1 + op2;

        this.setSomeFlags_(result, cpu);
        // Set CF and OF
        let uint_result: number = get_uint(result, this.operand_size);
        cpu.eFlags.set_carry_flag(result != uint_result);
        if (
            (op1 & get_sign_mask(this.operand_size)) ==
            (op2 & get_sign_mask(this.operand_size))
        ) {
            cpu.eFlags.set_overflow_flag(
                (op1 & get_sign_mask(this.operand_size)) !=
                    (uint_result & get_sign_mask(this.operand_size))
            );
        } else {
            cpu.eFlags.set_overflow_flag(false);
        }
        cpu.writeValue(dst, result, this.operand_size);
    }
}

class SubInstruction extends BinaryArithmeticInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "sub";
    }

    genMachineCode_(): void {}

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        let op1: number = cpu.readValue(dst, this.operand_size);
        // Calculate a - b = a + (-b)
        let op2: number = -1 * cpu.readValue(src, this.operand_size);
        let result: number = op1 + op2;

        this.setSomeFlags_(result, cpu);
        // Set CF and OF
        let uint_result: number = get_uint(result, this.operand_size);

        // Carry flag for subtraction is inverse of the addition
        /* https://stackoverflow.com/questions/8053053/how-does-an-adder-perform-unsigned-integer-subtraction/8061989#8061989 */
        cpu.eFlags.set_carry_flag(result == uint_result);

        if (
            (op1 & get_sign_mask(this.operand_size)) ==
            (op2 & get_sign_mask(this.operand_size))
        ) {
            cpu.eFlags.set_overflow_flag(
                (op1 & get_sign_mask(this.operand_size)) !=
                    (uint_result & get_sign_mask(this.operand_size))
            );
        } else {
            cpu.eFlags.set_overflow_flag(false);
        }
        cpu.writeValue(dst, result, this.operand_size);
    }
}

class IncOperator extends UnaryArithmeticInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "inc";
    }

    genMachineCode_(): void {}

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let dst: Operand = this.operands[0];
        let op1: number = cpu.readValue(dst, this.operand_size);
        let result: number = op1 + 1;

        this.setSomeFlags_(result, cpu);

        // Set only OF
        // inc and dec do not impact carry flag
        let uint_result: number = get_uint(result, this.operand_size);
        if (
            (op1 & get_sign_mask(this.operand_size)) ==
            (1 & get_sign_mask(this.operand_size))
        ) {
            cpu.eFlags.set_overflow_flag(
                (op1 & get_sign_mask(this.operand_size)) !=
                    (uint_result & get_sign_mask(this.operand_size))
            );
        } else {
            cpu.eFlags.set_overflow_flag(false);
        }
        cpu.writeValue(dst, result, this.operand_size);
    }
}

class DecOperator extends UnaryArithmeticInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "dec";
    }

    genMachineCode_(): void {}

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let dst: Operand = this.operands[0];
        let op1: number = cpu.readValue(dst, this.operand_size);
        let result: number = op1 - 1;

        this.setSomeFlags_(result, cpu);

        // Set only OF
        // inc and dec do not impact carry flag
        let uint_result: number = get_uint(result, this.operand_size);
        if (
            (op1 & get_sign_mask(this.operand_size)) ==
            (-1 & get_sign_mask(this.operand_size))
        ) {
            cpu.eFlags.set_overflow_flag(
                (op1 & get_sign_mask(this.operand_size)) !=
                    (uint_result & get_sign_mask(this.operand_size))
            );
        } else {
            cpu.eFlags.set_overflow_flag(false);
        }
        cpu.writeValue(dst, result, this.operand_size);
    }
}

export { AddInstruction, SubInstruction, IncOperator, DecOperator };
