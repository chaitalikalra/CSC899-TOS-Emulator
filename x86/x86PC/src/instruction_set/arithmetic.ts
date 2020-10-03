import { x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import { x86Operand } from "../operand";
import { get_uint, getSignMask, getParity } from "../utils";

abstract class ArithmeticInstruction extends x86Instruction {
    protected setSomeFlags_(result: number, cpu: CPU): void {
        // https://x86.puri.sm/html/file_module_x86_id_5.html
        // Arithmetic instructions do the following:
        // The OF, SF, ZF, CF, and PF flags are set according to the result.

        // Set only SF, ZF and PF. OF and CF are set in individual functions
        let uint_result: number = get_uint(result, this.instructionOpSize);
        cpu.eFlags.setZeroFlag(uint_result == 0);
        cpu.eFlags.setSignFlag(
            Boolean(uint_result & getSignMask(this.instructionOpSize))
        );
        cpu.eFlags.setParityFlag(getParity(uint_result));
    }
}

class AddInstruction extends ArithmeticInstruction {
    executeInstruction(cpu: CPU): void {
        let src: x86Operand = this.operands[0];
        let dst: x86Operand = this.operands[1];
        let op1: number = cpu.readOperand(src, this.instructionOpSize);
        let op2: number = cpu.readOperand(dst, this.instructionOpSize);
        let result: number = op1 + op2;

        this.setSomeFlags_(result, cpu);
        // Set CF and OF
        let uint_result: number = get_uint(result, this.instructionOpSize);
        cpu.eFlags.setCarryFlag(result != uint_result);
        if (
            (op1 & getSignMask(this.instructionOpSize)) ==
            (op2 & getSignMask(this.instructionOpSize))
        ) {
            cpu.eFlags.setOverflowFlag(
                (op1 & getSignMask(this.instructionOpSize)) !=
                    (uint_result & getSignMask(this.instructionOpSize))
            );
        } else {
            cpu.eFlags.setOverflowFlag(false);
        }
        cpu.writeOperand(dst, result, this.instructionOpSize);
    }
}

class SubInstruction extends ArithmeticInstruction {
    executeInstruction(cpu: CPU): void {
        let src: x86Operand = this.operands[0];
        let dst: x86Operand = this.operands[1];
        let op1: number = cpu.readOperand(dst, this.instructionOpSize);
        // Calculate a - b = a + (-b)
        let op2: number = -1 * cpu.readOperand(src, this.instructionOpSize);
        let result: number = op1 + op2;

        this.setSomeFlags_(result, cpu);
        // Set CF and OF
        let uint_result: number = get_uint(result, this.instructionOpSize);

        // Carry flag for subtraction is inverse of the addition
        /* https://stackoverflow.com/questions/8053053/how-does-an-adder-perform-unsigned-integer-subtraction/8061989#8061989 */
        cpu.eFlags.setCarryFlag(result == uint_result);

        if (
            (op1 & getSignMask(this.instructionOpSize)) ==
            (op2 & getSignMask(this.instructionOpSize))
        ) {
            cpu.eFlags.setOverflowFlag(
                (op1 & getSignMask(this.instructionOpSize)) !=
                    (uint_result & getSignMask(this.instructionOpSize))
            );
        } else {
            cpu.eFlags.setOverflowFlag(false);
        }
        cpu.writeOperand(dst, result, this.instructionOpSize);
    }
}

class IncInstruction extends ArithmeticInstruction {
    executeInstruction(cpu: CPU): void {
        let dst: x86Operand = this.operands[0];
        let op1: number = cpu.readOperand(dst, this.instructionOpSize);
        let result: number = op1 + 1;

        this.setSomeFlags_(result, cpu);

        // Set only OF
        // inc and dec do not impact carry flag
        let uint_result: number = get_uint(result, this.instructionOpSize);
        if (
            (op1 & getSignMask(this.instructionOpSize)) ==
            (1 & getSignMask(this.instructionOpSize))
        ) {
            cpu.eFlags.setOverflowFlag(
                (op1 & getSignMask(this.instructionOpSize)) !=
                    (uint_result & getSignMask(this.instructionOpSize))
            );
        } else {
            cpu.eFlags.setOverflowFlag(false);
        }
        cpu.writeOperand(dst, result, this.instructionOpSize);
    }
}

class DecInstruction extends ArithmeticInstruction {
    executeInstruction(cpu: CPU): void {
        let dst: x86Operand = this.operands[0];
        let op1: number = cpu.readOperand(dst, this.instructionOpSize);
        let result: number = op1 - 1;

        this.setSomeFlags_(result, cpu);

        // Set only OF
        // inc and dec do not impact carry flag
        let uint_result: number = get_uint(result, this.instructionOpSize);
        if (
            (op1 & getSignMask(this.instructionOpSize)) ==
            (-1 & getSignMask(this.instructionOpSize))
        ) {
            cpu.eFlags.setOverflowFlag(
                (op1 & getSignMask(this.instructionOpSize)) !=
                    (uint_result & getSignMask(this.instructionOpSize))
            );
        } else {
            cpu.eFlags.setOverflowFlag(false);
        }
        cpu.writeOperand(dst, result, this.instructionOpSize);
    }
}

export { AddInstruction, SubInstruction, IncInstruction, DecInstruction };
